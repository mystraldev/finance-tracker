import type { FinanceAction, FinanceData, FinanceState } from '../types/finance'

import { financeRepo } from '../data/financeRepo'
import { currentMonth } from '../utils/derive'

const EMPTY_DATA: FinanceData = {
  accounts: [],
  categories: [],
  transactions: [],
  savingsGoals: [],
}

function selectInitialMonth(data: FinanceData): string {
  const month = currentMonth()
  const months = financeRepo.availableMonths(data)
  return months.includes(month) ? month : months[0] ?? month
}

export function createState(data: FinanceData): FinanceState {
  return { ...data, selectedMonth: selectInitialMonth(data) }
}

export function initEmpty(): FinanceState {
  return createState(EMPTY_DATA)
}

export function reducer(state: FinanceState, action: FinanceAction): FinanceState {
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
    case 'SET_DATA':
    case 'IMPORT_DATA': {
      return createState(action.payload)
    }
    case 'RESET': {
      return createState(EMPTY_DATA)
    }

    default: {
      return state
    }
  }
}
