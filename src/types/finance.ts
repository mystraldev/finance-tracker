import type { ComponentType, LucideProps } from 'lucide-react'

export type IconRegistry = Record<string, ComponentType<LucideProps>>

export type Account = {
  id: string
  name: string
  type: 'cash' | 'savings' | 'investment'
  icon: string
  accent: string
  openingBalance: number
}

export type AccountWithBalance = Account & {
  balance: number
}

export type Category = {
  id: string
  label: string
  icon: string
  color: string
}

export type CategoryBreakdownItem = Category & {
  amount: number
}

export type Transaction = {
  id: string
  date: string
  amount: number
  description: string
  accountId: string
  categoryId: string
}

export type EnrichedTransaction = Transaction & {
  category: string
  icon: string
}

export type SparklineDatum = {
  label: string
  value: number
}

export type FinanceData = {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
}

export type FinanceState = FinanceData & {
  selectedMonth: string
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Partial<Transaction> & { id: string } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Partial<Category> & { id: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Partial<Account> & { id: string } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'RESET' }

export interface FinanceContextValue extends FinanceState {
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (tx: Partial<Transaction> & { id: string }) => void
  deleteTransaction: (_id: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (cat: Partial<Category> & { id: string }) => void
  deleteCategory: (_id: string) => void
  addAccount: (acc: Omit<Account, 'id'>) => void
  updateAccount: (acc: Partial<Account> & { id: string }) => void
  deleteAccount: (_id: string) => void
  setMonth: (_m: string) => void
  reset: () => void
}
