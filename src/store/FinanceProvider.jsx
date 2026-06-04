import { useEffect, useMemo, useReducer } from 'react'
import { seed } from '../data/finance'
import { currentMonth } from '../utils/derive'
import { FinanceContext } from './financeContext'

const STORAGE_KEY = 'finance-tracker:v1'

/** ID único. `crypto.randomUUID` solo existe en contextos seguros (https/localhost);
 *  como la app se abre por IP de red sobre http, incluimos un fallback. */
function uid() {
  if (globalThis.crypto?.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {
      /* sigue al fallback */
    }
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Copia profunda de la semilla (evita compartir referencias entre recargas). */
function freshSeed() {
  return {
    accounts: seed.accounts.map((a) => ({ ...a })),
    categories: seed.categories.map((c) => ({ ...c })),
    transactions: seed.transactions.map((t) => ({ ...t })),
  }
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function init() {
  const data = loadPersisted() ?? freshSeed()
  return { ...data, selectedMonth: currentMonth() }
}

function reducer(state, action) {
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
      return { ...freshSeed(), selectedMonth: currentMonth() }

    default:
      return state
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { accounts, categories, transactions } = state

  // Persistimos solo los datos (no el mes seleccionado, que es estado de UI).
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accounts, categories, transactions }),
      )
    } catch {
      /* almacenamiento no disponible: seguimos en memoria */
    }
  }, [accounts, categories, transactions])

  const value = useMemo(
    () => ({
      ...state,
      // movimientos
      addTransaction: (tx) =>
        dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), ...tx } }),
      updateTransaction: (tx) => dispatch({ type: 'UPDATE_TRANSACTION', payload: tx }),
      deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
      // categorías
      addCategory: (cat) =>
        dispatch({ type: 'ADD_CATEGORY', payload: { id: uid(), ...cat } }),
      updateCategory: (cat) => dispatch({ type: 'UPDATE_CATEGORY', payload: cat }),
      deleteCategory: (id) => dispatch({ type: 'DELETE_CATEGORY', payload: id }),
      // cuentas
      addAccount: (acc) =>
        dispatch({ type: 'ADD_ACCOUNT', payload: { id: uid(), ...acc } }),
      updateAccount: (acc) => dispatch({ type: 'UPDATE_ACCOUNT', payload: acc }),
      deleteAccount: (id) => dispatch({ type: 'DELETE_ACCOUNT', payload: id }),
      // ui
      setMonth: (m) => dispatch({ type: 'SET_MONTH', payload: m }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
