import type { Account, Category, FinanceAction, FinanceData, FinanceState, SavingsGoal, Transaction, TransactionQuery } from '../types/finance'
import type { ReactNode } from 'react'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { financeRepo } from '../data/financeRepo'
import * as supabaseRepo from '../data/supabaseFinanceRepo'
import { useAuth } from './authContext'
import { FinanceContext } from './financeContext'
import { initEmpty, reducer } from './financeReducer'

type LoadStatus = 'loading' | 'ready' | 'error'

type Dispatch = (action: FinanceAction) => void
type Persist = (operation: () => Promise<void>) => void

// Serialise writes so dependent rows (e.g. an account then a transaction that
// references it) reach the database in call order, avoiding FK races.
function makeWriteQueue() {
  let tail: Promise<void> = Promise.resolve()
  return (operation: () => Promise<void>, onError: (error: unknown) => void): void => {
    tail = runNext(tail, operation, onError)
  }
}

async function runNext(
  previous: Promise<void>,
  operation: () => Promise<void>,
  onError: (error: unknown) => void,
): Promise<void> {
  await previous
  try {
    await operation()
  } catch (error) {
    onError(error)
  }
}

function createFinanceActions(state: FinanceState, userId: string | undefined, dispatch: Dispatch, persist: Persist) {
  return {
    getTransactions: (query?: TransactionQuery) => financeRepo.listTransactions(state, query),
    getAvailableMonths: () => financeRepo.availableMonths(state),
    addTransaction: (tx: Omit<Transaction, 'id'>) => {
      const entity: Transaction = { id: supabaseRepo.newId(), ...tx }
      dispatch({ type: 'ADD_TRANSACTION', payload: entity })
      if (userId) persist(() => supabaseRepo.upsertTransaction(userId, entity))
    },
    updateTransaction: (tx: Partial<Transaction> & { id: string }) => {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx })
      const current = state.transactions.find((t) => t.id === tx.id)
      if (current && userId) persist(() => supabaseRepo.upsertTransaction(userId, { ...current, ...tx }))
    },
    deleteTransaction: (id: string) => {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id })
      persist(() => supabaseRepo.deleteTransaction(id))
    },
    addCategory: (cat: Omit<Category, 'id'>) => {
      const entity: Category = { id: supabaseRepo.newId(), ...cat }
      dispatch({ type: 'ADD_CATEGORY', payload: entity })
      if (userId) persist(() => supabaseRepo.upsertCategory(userId, entity))
    },
    updateCategory: (cat: Partial<Category> & { id: string }) => {
      dispatch({ type: 'UPDATE_CATEGORY', payload: cat })
      const current = state.categories.find((c) => c.id === cat.id)
      if (current && userId) persist(() => supabaseRepo.upsertCategory(userId, { ...current, ...cat }))
    },
    deleteCategory: (id: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: id })
      if (state.transactions.every((t) => t.categoryId !== id)) {
        persist(() => supabaseRepo.deleteCategory(id))
      }
    },
    addAccount: (account: Omit<Account, 'id'>) => {
      const entity: Account = { id: supabaseRepo.newId(), ...account }
      dispatch({ type: 'ADD_ACCOUNT', payload: entity })
      if (userId) persist(() => supabaseRepo.upsertAccount(userId, entity))
    },
    updateAccount: (account: Partial<Account> & { id: string }) => {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: account })
      const current = state.accounts.find((a) => a.id === account.id)
      if (current && userId) persist(() => supabaseRepo.upsertAccount(userId, { ...current, ...account }))
    },
    deleteAccount: (id: string) => {
      dispatch({ type: 'DELETE_ACCOUNT', payload: id })
      const referenced =
        state.transactions.some((t) => t.accountId === id) ||
        state.savingsGoals.some((g) => g.accountId === id)
      if (!referenced) persist(() => supabaseRepo.deleteAccount(id))
    },
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => {
      const entity: SavingsGoal = { id: supabaseRepo.newId(), ...goal }
      dispatch({ type: 'ADD_SAVINGS_GOAL', payload: entity })
      if (userId) persist(() => supabaseRepo.upsertSavingsGoal(userId, entity))
    },
    updateSavingsGoal: (goal: Partial<SavingsGoal> & { id: string }) => {
      dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal })
      const current = state.savingsGoals.find((g) => g.id === goal.id)
      if (current && userId) persist(() => supabaseRepo.upsertSavingsGoal(userId, { ...current, ...goal }))
    },
    deleteSavingsGoal: (id: string) => {
      dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id })
      persist(() => supabaseRepo.deleteSavingsGoal(id))
    },
    setMonth: (m: string) => dispatch({ type: 'SET_MONTH', payload: m }),
    importData: (data: FinanceData) => {
      const remapped = supabaseRepo.remapFinanceData(data)
      dispatch({ type: 'IMPORT_DATA', payload: remapped })
      if (userId) persist(() => supabaseRepo.replaceAllData(userId, remapped))
    },
    reset: () => {
      dispatch({ type: 'RESET' })
      persist(() => supabaseRepo.clearAllData())
    },
  }
}

function FinanceStatus({ status, onRetry }: { status: LoadStatus; onRetry: () => void }) {
  if (status === 'error') {
    return (
      <div className="app-status app-status--error">
        <p>No se pudieron cargar tus datos.</p>
        <button className="btn-primary" onClick={onRetry} type="button">
          Reintentar
        </button>
      </div>
    )
  }
  return <div className="app-status">Cargando tus datos…</div>
}

type FinanceProviderProperties = {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProperties) {
  const { user } = useAuth()
  const userId = user?.id
  const [state, dispatch] = useReducer(reducer, undefined, initEmpty)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [enqueueWrite] = useState(makeWriteQueue)
  const [saveError, setSaveError] = useState(false)

  const reload = useCallback(async () => {
    try {
      const data = await supabaseRepo.fetchFinanceData()
      dispatch({ type: 'SET_DATA', payload: data })
      setStatus('ready')
    } catch (error) {
      // eslint-disable-next-line no-console -- surface persistence failures while debugging
      console.error('[finance] failed to reload data', error)
      setStatus('error')
    }
  }, [])

  const persist = useCallback<Persist>(
    (operation) => {
      enqueueWrite(
        async () => {
          await operation()
          setSaveError(false)
        },
        (error) => {
          // eslint-disable-next-line no-console -- surface persistence failures while debugging
          console.error('[finance] failed to save change', error)
          setSaveError(true)
          void reload()
        },
      )
    },
    [enqueueWrite, reload],
  )

  useEffect(() => {
    if (!userId) return
    let isActive = true

    async function load() {
      try {
        const data = await supabaseRepo.fetchFinanceData()
        if (!isActive) return
        dispatch({ type: 'SET_DATA', payload: data })
        setStatus('ready')
      } catch (error) {
        if (!isActive) return
        // eslint-disable-next-line no-console -- surface persistence failures while debugging
        console.error('[finance] failed to load data', error)
        setStatus('error')
      }
    }
    void load()

    return () => {
      isActive = false
    }
  }, [userId])

  const value = useMemo(
    () => ({ ...state, ...createFinanceActions(state, userId, dispatch, persist) }),
    [state, userId, persist],
  )

  return (
    <FinanceContext.Provider value={value}>
      {saveError && (
        <div className="save-error" role="alert">
          <span>No se ha podido guardar tu último cambio. Revisa tu conexión.</span>
          <button aria-label="Cerrar" className="save-error__close" onClick={() => setSaveError(false)} type="button">
            ✕
          </button>
        </div>
      )}
      {status === 'ready' ? children : <FinanceStatus onRetry={() => void reload()} status={status} />}
    </FinanceContext.Provider>
  )
}
