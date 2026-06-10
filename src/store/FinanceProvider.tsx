import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { financeRepository } from '../data/financeRepository'
import { currentMonth } from '../utils/derive'
import { recurringOccurrenceDate, recurringOccurrences } from '../utils/recurring'
import { FinanceContext } from './financeContext'
import type { Account, Category, FinanceAction, FinanceData, FinanceState, RecurringRule, RecurringRuleDraft, SavingsGoal, Transaction, TransactionQuery, Transfer } from '../types/finance'

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
  return createState(financeRepository.load())
}

function createState(data: FinanceData): FinanceState {
  return { ...data, selectedMonth: selectInitialMonth(data) }
}

function selectInitialMonth(data: FinanceData): string {
  const month = currentMonth()
  const months = financeRepository.availableMonths(data)
  return months.includes(month) ? month : months[0] ?? month
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
    case 'ADD_TRANSFER':
      return { ...state, transfers: [...state.transfers, action.payload] }
    case 'UPDATE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
      }
    case 'DELETE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.filter((t) => t.id !== action.payload),
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
      if (
        state.transactions.some((t) => t.categoryId === action.payload) ||
        state.recurringRules.some((rule) => rule.type !== 'transfer' && rule.categoryId === action.payload)
      ) {
        return state
      }
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
      if (
        state.transactions.some((t) => t.accountId === action.payload) ||
        state.transfers.some(
          (t) => t.fromAccountId === action.payload || t.toAccountId === action.payload,
        ) ||
        state.recurringRules.some((rule) =>
          rule.type === 'transfer'
            ? rule.fromAccountId === action.payload || rule.toAccountId === action.payload
            : rule.accountId === action.payload,
        ) ||
        state.savingsGoals.some((g) => g.accountId === action.payload)
      ) {
        return state
      }
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
      }

    case 'ADD_SAVINGS_GOAL':
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] }
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g,
        ),
      }
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload),
      }

    case 'ADD_RECURRING_RULE':
      return { ...state, recurringRules: [...state.recurringRules, action.payload] }
    case 'UPDATE_RECURRING_RULE':
      return {
        ...state,
        recurringRules: state.recurringRules.map((rule) =>
          rule.id === action.payload.id ? { ...rule, ...action.payload } as RecurringRule : rule,
        ),
      }
    case 'DELETE_RECURRING_RULE':
      return {
        ...state,
        recurringRules: state.recurringRules.filter((rule) => rule.id !== action.payload),
        recurringSkips: state.recurringSkips.filter((skip) => skip.ruleId !== action.payload),
      }
    case 'SKIP_RECURRING_OCCURRENCE':
      if (
        state.recurringSkips.some(
          (skip) =>
            skip.ruleId === action.payload.ruleId && skip.month === action.payload.month,
        )
      ) {
        return state
      }
      return { ...state, recurringSkips: [...state.recurringSkips, action.payload] }
    case 'UNSKIP_RECURRING_OCCURRENCE':
      return {
        ...state,
        recurringSkips: state.recurringSkips.filter(
          (skip) =>
            skip.ruleId !== action.payload.ruleId || skip.month !== action.payload.month,
        ),
      }

    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload }
    case 'IMPORT_DATA':
      return createState(action.payload)
    case 'RESET':
      return createState(financeRepository.seed())

    default:
      return state
  }
}

type FinanceProviderProps = {
  children: ReactNode
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { accounts, categories, transactions, transfers, recurringRules, recurringSkips, savingsGoals } = state

  useEffect(() => {
    financeRepository.save({ accounts, categories, transactions, transfers, recurringRules, recurringSkips, savingsGoals })
  }, [accounts, categories, recurringRules, recurringSkips, savingsGoals, transactions, transfers])

  const value = useMemo(
    () => ({
      ...state,
      getTransactions: (query?: TransactionQuery) =>
        financeRepository.listTransactions(state, query),
      getActivities: (query?: TransactionQuery) =>
        financeRepository.listActivities(state, query),
      getAvailableMonths: () => financeRepository.availableMonths(state),
      getRecurringOccurrences: (month: string) => recurringOccurrences(state, month),
      addTransaction: (tx: Omit<Transaction, 'id'>) =>
        dispatch({ type: 'ADD_TRANSACTION', payload: { id: uid(), ...tx } }),
      updateTransaction: (tx: Partial<Transaction> & { id: string }) =>
        dispatch({ type: 'UPDATE_TRANSACTION', payload: tx }),
      deleteTransaction: (id: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
      addTransfer: (transfer: Omit<Transfer, 'id'>) =>
        dispatch({ type: 'ADD_TRANSFER', payload: { id: uid(), ...transfer } }),
      updateTransfer: (transfer: Partial<Transfer> & { id: string }) =>
        dispatch({ type: 'UPDATE_TRANSFER', payload: transfer }),
      deleteTransfer: (id: string) => dispatch({ type: 'DELETE_TRANSFER', payload: id }),
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
      addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) =>
        dispatch({ type: 'ADD_SAVINGS_GOAL', payload: { id: uid(), ...goal } }),
      updateSavingsGoal: (goal: Partial<SavingsGoal> & { id: string }) =>
        dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal }),
      deleteSavingsGoal: (id: string) =>
        dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id }),
      addRecurringRule: (rule: RecurringRuleDraft) =>
        dispatch({ type: 'ADD_RECURRING_RULE', payload: { id: uid(), ...rule } as RecurringRule }),
      updateRecurringRule: (rule: Partial<RecurringRule> & { id: string }) =>
        dispatch({ type: 'UPDATE_RECURRING_RULE', payload: rule }),
      deleteRecurringRule: (id: string) =>
        dispatch({ type: 'DELETE_RECURRING_RULE', payload: id }),
      confirmRecurringOccurrence: (ruleId: string, month: string) => {
        const occurrence = recurringOccurrences(state, month).find(
          (item) => item.rule.id === ruleId,
        )
        if (!occurrence || occurrence.status === 'confirmed') return

        const rule = occurrence.rule
        const common = {
          date: recurringOccurrenceDate(rule, month),
          amount: rule.amount,
          description: rule.description,
          recurringRuleId: rule.id,
          recurrenceMonth: month,
        }

        if (rule.type === 'transfer') {
          dispatch({
            type: 'ADD_TRANSFER',
            payload: {
              id: uid(),
              ...common,
              fromAccountId: rule.fromAccountId,
              toAccountId: rule.toAccountId,
            },
          })
        } else {
          dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
              id: uid(),
              ...common,
              amount: rule.type === 'expense' ? -rule.amount : rule.amount,
              accountId: rule.accountId,
              categoryId: rule.categoryId,
            },
          })
        }
        dispatch({ type: 'UNSKIP_RECURRING_OCCURRENCE', payload: { ruleId, month } })
      },
      skipRecurringOccurrence: (ruleId: string, month: string) =>
        dispatch({
          type: 'SKIP_RECURRING_OCCURRENCE',
          payload: { id: uid(), ruleId, month },
        }),
      setMonth: (m: string) => dispatch({ type: 'SET_MONTH', payload: m }),
      importData: (data: FinanceData) => dispatch({ type: 'IMPORT_DATA', payload: data }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
