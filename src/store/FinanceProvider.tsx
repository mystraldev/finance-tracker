import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { financeRepository } from '../data/financeRepository'
import { currentMonth } from '../utils/derive'
import { FinanceContext } from './financeContext'
import type { Account, Category, FinanceAction, FinanceState, Transaction, TransactionQuery } from '../types/finance'

function uid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      /* fallback */
    }
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function init(): FinanceState {
  const data = financeRepository.load()
  return { ...data, selectedMonth: currentMonth() }
}

function reducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
      }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c,
        ),
      }
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      }

    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] }
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a,
        ),
      }
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
      }

    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload }
    case 'RESET':
      return { ...financeRepository.seed(), selectedMonth: currentMonth() }

    default:
      return state
  }
}

type FinanceProviderProps = {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { accounts, categories, transactions } = state

  useEffect(() => {
    financeRepository.save({ accounts, categories, transactions })
  }, [accounts, categories, transactions])

  const value = useMemo(
    () => ({
      ...state,
      getTransactions: (query?: TransactionQuery) =>
        financeRepository.listTransactions(state, query),
      getAvailableMonths: () => financeRepository.availableMonths(state),
      addTransaction: (tx: Omit<Transaction, 'id'>) =>
        dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), ...tx } }),
      updateTransaction: (tx: Partial<Transaction> & { id: string }) =>
        dispatch({ type: 'UPDATE_TRANSACTION', payload: tx }),
      deleteTransaction: (id: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
      addCategory: (cat: Omit<Category, 'id'>) =>
        dispatch({ type: 'ADD_CATEGORY', payload: { id: uid(), ...cat } }),
      updateCategory: (cat: Partial<Category> & { id: string }) =>
        dispatch({ type: 'UPDATE_CATEGORY', payload: cat }),
      deleteCategory: (id: string) => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
      addAccount: (acc: Omit<Account, 'id'>) =>
        dispatch({ type: 'ADD_ACCOUNT', payload: { id: uid(), ...acc } }),
      updateAccount: (acc: Partial<Account> & { id: string }) =>
        dispatch({ type: 'UPDATE_ACCOUNT', payload: acc }),
      deleteAccount: (id: string) => dispatch({ type: 'DELETE_ACCOUNT', payload: id }),
      setMonth: (m: string) => dispatch({ type: 'SET_MONTH', payload: m }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
