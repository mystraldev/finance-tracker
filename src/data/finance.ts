import type {
  Account,
  Category,
  FinanceData,
  RecurringRule,
  RecurringSkip,
  SavingsGoal,
  Transaction,
  Transfer,
} from '../types/finance'

export const accounts: Account[] = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash',
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 1500,
  },
  {
    id: 'savings',
    name: 'Cuenta remunerada',
    type: 'savings',
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 12500,
    interestRate: 0.0275,
  },
  {
    id: 'investments',
    name: 'Inversiones',
    type: 'investment',
    icon: 'trending',
    accent: 'violet',
    openingBalance: 18340.18,
  },
]

export const categories: Category[] = [
  { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
  { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home', budget: 1100 },
  { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart', budget: 400 },
  { id: 'transport', label: 'Transporte', color: '#f59e0b', icon: 'car', budget: 200 },
  { id: 'leisure', label: 'Ocio', color: '#ec4899', icon: 'leisure', budget: 400 },
  { id: 'health', label: 'Salud', color: '#06b6d4', icon: 'health' },
  { id: 'other', label: 'Otros', color: '#94a3b8', icon: 'package' },
]

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

const EXPENSE_TEMPLATE: { categoryId: string; description: string; base: number; day: number; fixed?: boolean }[] = [
  { categoryId: 'home', description: 'Alquiler', base: 850, day: 2, fixed: true },
  { categoryId: 'food', description: 'Supermercado', base: 410, day: 8 },
  { categoryId: 'transport', description: 'Gasolina', base: 185, day: 11 },
  { categoryId: 'leisure', description: 'Ocio y restaurantes', base: 250, day: 16 },
  { categoryId: 'health', description: 'Farmacia', base: 95, day: 19 },
  { categoryId: 'other', description: 'Compras varias', base: 285, day: 23 },
]

const VARIATION = [0.92, 1.08, 0.85, 1.12, 0.97, 1.0]

function buildTransactions(): Transaction[] {
  const txs: Transaction[] = []
  MONTHS.forEach((month, i) => {
    txs.push({
      id: `seed-${month}-income`,
      accountId: 'checking',
      categoryId: 'income',
      description: 'Nómina',
      date: `${month}-01`,
      amount: 3200,
      recurringRuleId: 'rule-payroll',
      recurrenceMonth: month,
    })
    EXPENSE_TEMPLATE.forEach((e) => {
      const factor = e.fixed ? 1 : VARIATION[i]
      const amount = Math.round(e.base * factor * 100) / 100
      txs.push({
        id: `seed-${month}-${e.categoryId}`,
        accountId: 'checking',
        categoryId: e.categoryId,
        description: e.description,
        date: `${month}-${String(e.day).padStart(2, '0')}`,
        amount: -amount,
        recurringRuleId: e.categoryId === 'home' ? 'rule-rent' : undefined,
        recurrenceMonth: e.categoryId === 'home' ? month : undefined,
      })
    })
  })
  return txs
}

export const transactions: Transaction[] = buildTransactions()

export const transfers: Transfer[] = [
  {
    id: 'seed-2026-06-savings-transfer',
    fromAccountId: 'checking',
    toAccountId: 'savings',
    description: 'Aportación a ahorro',
    date: '2026-06-04',
    amount: 500,
    recurringRuleId: 'rule-savings-transfer',
    recurrenceMonth: '2026-06',
  },
]

export const recurringRules: RecurringRule[] = [
  {
    id: 'rule-payroll',
    type: 'income',
    description: 'Nómina',
    amount: 3200,
    dayOfMonth: 1,
    accountId: 'checking',
    categoryId: 'income',
    startMonth: '2026-01',
    active: true,
    frequency: 'monthly',
  },
  {
    id: 'rule-rent',
    type: 'expense',
    description: 'Alquiler',
    amount: 850,
    dayOfMonth: 2,
    accountId: 'checking',
    categoryId: 'home',
    startMonth: '2026-01',
    active: true,
    frequency: 'monthly',
  },
  {
    id: 'rule-savings-transfer',
    type: 'transfer',
    description: 'Aportación a ahorro',
    amount: 500,
    dayOfMonth: 4,
    fromAccountId: 'checking',
    toAccountId: 'savings',
    startMonth: '2026-06',
    active: true,
    frequency: 'monthly',
  },
]

export const recurringSkips: RecurringSkip[] = []

export const savingsGoals: SavingsGoal[] = [
  {
    id: 'goal-emergency-fund',
    name: 'Fondo de emergencia',
    targetAmount: 6000,
    savedAmount: 2400,
    accountId: 'savings',
    icon: 'health',
    color: '#10b981',
  },
  {
    id: 'goal-trip',
    name: 'Viaje',
    targetAmount: 3000,
    savedAmount: 850,
    accountId: 'checking',
    icon: 'plane',
    color: '#3b82f6',
    targetDate: '2026-10-01',
  },
]

export const seed: FinanceData = {
  accounts,
  categories,
  transactions,
  transfers,
  recurringRules,
  recurringSkips,
  savingsGoals,
}
