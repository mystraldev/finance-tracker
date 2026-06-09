import type { LucideIcon } from 'lucide-react'

export type IconRegistry = Record<string, LucideIcon>

export type Account = {
  id: string
  name: string
  type: 'cash' | 'savings' | 'investment'
  icon: string
  accent: string
  openingBalance: number
  interestRate?: number
}

export type AccountWithBalance = Account & {
  balance: number
}

export type Category = {
  id: string
  label: string
  icon: string
  color: string
  /** Optional monthly spending budget, in EUR. Undefined = no budget. */
  budget?: number
}

export type BudgetStatus = 'ok' | 'warning' | 'over'
export type BudgetPaceStatus = 'on-track' | 'at-risk' | 'over'

export type CategoryBudget = Category & {
  budget: number
  spent: number
  remaining: number
  pct: number
  status: BudgetStatus
  paceStatus: BudgetPaceStatus
  expectedPct: number
  projectedSpend: number
  dailyRemaining: number
  previousSpent: number
  previousDelta: number
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
  recurringRuleId?: string
  recurrenceMonth?: string
}

export type Transfer = {
  id: string
  date: string
  amount: number
  description: string
  fromAccountId: string
  toAccountId: string
  recurringRuleId?: string
  recurrenceMonth?: string
}

export type SavingsGoal = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  icon: string
  color: string
  accountId?: string
  targetDate?: string
}

export type RecurringFrequency = 'monthly'

export type RecurringTransactionRule = {
  id: string
  type: 'income' | 'expense'
  description: string
  amount: number
  dayOfMonth: number
  accountId: string
  categoryId: string
  startMonth: string
  endMonth?: string
  active: boolean
  frequency: RecurringFrequency
}

export type RecurringTransferRule = {
  id: string
  type: 'transfer'
  description: string
  amount: number
  dayOfMonth: number
  fromAccountId: string
  toAccountId: string
  startMonth: string
  endMonth?: string
  active: boolean
  frequency: RecurringFrequency
}

export type RecurringRule = RecurringTransactionRule | RecurringTransferRule
export type RecurringRuleDraft =
  | Omit<RecurringTransactionRule, 'id'>
  | Omit<RecurringTransferRule, 'id'>

export type RecurringSkip = {
  id: string
  ruleId: string
  month: string
}

export type RecurringOccurrenceStatus = 'pending' | 'confirmed' | 'skipped'

export type RecurringOccurrence = {
  id: string
  rule: RecurringRule
  month: string
  date: string
  status: RecurringOccurrenceStatus
  activityId?: string
}

export type TransactionTypeFilter = 'all' | 'income' | 'expense' | 'transfer'
export type TransactionSort = 'date-asc' | 'date-desc' | 'amount-asc' | 'amount-desc' | 'none'

export type TransactionQuery = {
  month?: string | 'all'
  categoryId?: string | 'all'
  accountId?: string | 'all'
  type?: TransactionTypeFilter
  sort?: TransactionSort
  search?: string
  limit?: number
}

export type EnrichedTransaction = Transaction & {
  category: string
  icon: string
  color: string
}

export type FinanceActivity =
  | {
      kind: 'transaction'
      id: string
      date: string
      amount: number
      description: string
      accountId: string
      categoryId: string
      recurringRuleId?: string
      recurrenceMonth?: string
    }
  | {
      kind: 'transfer'
      id: string
      date: string
      amount: number
      description: string
      fromAccountId: string
      toAccountId: string
      recurringRuleId?: string
      recurrenceMonth?: string
    }

export type SparklineDatum = {
  label: string
  value: number
}

export type FinanceData = {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  transfers: Transfer[]
  recurringRules: RecurringRule[]
  recurringSkips: RecurringSkip[]
  savingsGoals: SavingsGoal[]
}

export type FinanceState = FinanceData & {
  selectedMonth: string
}

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Partial<Transaction> & { id: string } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_TRANSFER'; payload: Transfer }
  | { type: 'UPDATE_TRANSFER'; payload: Partial<Transfer> & { id: string } }
  | { type: 'DELETE_TRANSFER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Partial<Category> & { id: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Partial<Account> & { id: string } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: Partial<SavingsGoal> & { id: string } }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'ADD_RECURRING_RULE'; payload: RecurringRule }
  | { type: 'UPDATE_RECURRING_RULE'; payload: Partial<RecurringRule> & { id: string } }
  | { type: 'DELETE_RECURRING_RULE'; payload: string }
  | { type: 'SKIP_RECURRING_OCCURRENCE'; payload: RecurringSkip }
  | { type: 'UNSKIP_RECURRING_OCCURRENCE'; payload: { ruleId: string; month: string } }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'IMPORT_DATA'; payload: FinanceData }
  | { type: 'RESET' }

export interface FinanceContextValue extends FinanceState {
  getTransactions: (_query?: TransactionQuery) => Transaction[]
  getActivities: (_query?: TransactionQuery) => FinanceActivity[]
  getAvailableMonths: () => string[]
  getRecurringOccurrences: (_month: string) => RecurringOccurrence[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  updateTransaction: (tx: Partial<Transaction> & { id: string }) => void
  deleteTransaction: (_id: string) => void
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void
  updateTransfer: (transfer: Partial<Transfer> & { id: string }) => void
  deleteTransfer: (_id: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  updateCategory: (cat: Partial<Category> & { id: string }) => void
  deleteCategory: (_id: string) => void
  addAccount: (acc: Omit<Account, 'id'>) => void
  updateAccount: (acc: Partial<Account> & { id: string }) => void
  deleteAccount: (_id: string) => void
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (goal: Partial<SavingsGoal> & { id: string }) => void
  deleteSavingsGoal: (_id: string) => void
  addRecurringRule: (rule: RecurringRuleDraft) => void
  updateRecurringRule: (rule: Partial<RecurringRule> & { id: string }) => void
  deleteRecurringRule: (_id: string) => void
  confirmRecurringOccurrence: (_ruleId: string, _month: string) => void
  skipRecurringOccurrence: (_ruleId: string, _month: string) => void
  setMonth: (_m: string) => void
  importData: (_data: FinanceData) => void
  reset: () => void
}
