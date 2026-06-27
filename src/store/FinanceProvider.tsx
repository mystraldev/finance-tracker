import type { Account, Category, FinanceAction, FinanceData, FinanceState, SavingsGoal, Transaction, TransactionQuery } from '../types/finance'
import type {ReactNode} from 'react';

import {  useEffect, useMemo, useReducer } from 'react'

import { financeRepo } from '../data/financeRepo'
import { currentMonth } from '../utils/derive'
import { FinanceContext } from './financeContext'

function uid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {
      /* fallback */
    }
  }
  // eslint-disable-next-line sonarjs/pseudo-random -- crypto.randomUUID fallback; IDs not security-critical
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function init(): FinanceState {
  return createState(financeRepo.load())
}

function createState(data: FinanceData): FinanceState {
  return { ...data, selectedMonth: selectInitialMonth(data) }
}

function selectInitialMonth(data: FinanceData): string {
  const month = currentMonth()
  const months = financeRepo.availableMonths(data)
  return months.includes(month) ? month : months[0] ?? month
}

function reducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      return { ...state, transactions: [...state.transactions, action.payload] }
    }
    case 'UPDATE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
      }
    }
    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      }
    }

    case 'ADD_CATEGORY': {
      return { ...state, categories: [...state.categories, action.payload] }
    }
    case 'UPDATE_CATEGORY': {
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c,
        ),
      }
    }
    case 'DELETE_CATEGORY': {
      if (state.transactions.some((t) => t.categoryId === action.payload)) {
        return state
      }
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      }
    }

    case 'ADD_ACCOUNT': {
      return { ...state, accounts: [...state.accounts, action.payload] }
    }
    case 'UPDATE_ACCOUNT': {
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a,
        ),
      }
    }
    case 'DELETE_ACCOUNT': {
      if (
        state.transactions.some((t) => t.accountId === action.payload) ||
        state.savingsGoals.some((g) => g.accountId === action.payload)
      ) {
        return state
      }
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
      }
    }

    case 'ADD_SAVINGS_GOAL': {
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] }
    }
    case 'UPDATE_SAVINGS_GOAL': {
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g,
        ),
      }
    }
    case 'DELETE_SAVINGS_GOAL': {
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload),
      }
    }

    case 'SET_MONTH': {
      return { ...state, selectedMonth: action.payload }
    }
    case 'IMPORT_DATA': {
      return createState(action.payload)
    }
    case 'RESET': {
      return createState(financeRepo.seed())
    }

    default: {
      return state
    }
  }
}

type FinanceProviderProperties = {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProperties) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { accounts, categories, transactions, savingsGoals } = state

  useEffect(() => {
    financeRepo.save({ accounts, categories, transactions, savingsGoals })
  }, [accounts, categories, savingsGoals, transactions])

  const value = useMemo(
    () => ({
      ...state,
      getTransactions: (query?: TransactionQuery) =>
        financeRepo.listTransactions(state, query),
      getAvailableMonths: () => financeRepo.availableMonths(state),
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
      addAccount: (accumulator: Omit<Account, 'id'>) =>
        dispatch({ type: 'ADD_ACCOUNT', payload: { id: uid(), ...accumulator } }),
      updateAccount: (accumulator: Partial<Account> & { id: string }) =>
        dispatch({ type: 'UPDATE_ACCOUNT', payload: accumulator }),
      deleteAccount: (id: string) => dispatch({ type: 'DELETE_ACCOUNT', payload: id }),
      addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) =>
        dispatch({ type: 'ADD_SAVINGS_GOAL', payload: { id: uid(), ...goal } }),
      updateSavingsGoal: (goal: Partial<SavingsGoal> & { id: string }) =>
        dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal }),
      deleteSavingsGoal: (id: string) =>
        dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id }),
      setMonth: (m: string) => dispatch({ type: 'SET_MONTH', payload: m }),
      importData: (data: FinanceData) => dispatch({ type: 'IMPORT_DATA', payload: data }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
