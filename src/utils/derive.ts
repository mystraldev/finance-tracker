import type { Account, AccountWithBalance, Category, CategoryBreakdownItem, EnrichedTransaction, FinanceData, SparklineDatum, Transaction } from '../types/finance'
import { fractionOf } from './math'

export function monthKey(date: string): string {
  return String(date).slice(0, 7)
}

export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function monthsBack(endMonth: string, n: number): string[] {
  const [y, m] = endMonth.split('-').map(Number)
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

const longMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const shortMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  timeZone: 'UTC',
})

function monthDate(month: string): Date {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1))
}

export function monthLabel(month: string): string {
  const text = longMonthFormatter.format(monthDate(month))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function shortMonthLabel(month: string): string {
  return shortMonthFormatter.format(monthDate(month)).replace('.', '')
}

export function monthTransactions(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === month)
}

export function availableMonths(transactions: Transaction[]): string[] {
  const set = new Set(transactions.map((t) => monthKey(t.date)))
  return [...set].sort((a, b) => (a < b ? 1 : -1))
}

export function incomeExpenses(transactions: Transaction[], month: string): { income: number; expenses: number; saved: number } {
  const m = monthTransactions(transactions, month)
  const income = m.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = m
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expenses, saved: income - expenses }
}

export function accountBalanceAsOf(account: Account, transactions: Transaction[], month: string | null = null): number {
  const sum = transactions
    .filter((t) => t.accountId === account.id && (!month || monthKey(t.date) <= month))
    .reduce((s, t) => s + t.amount, 0)
  return account.openingBalance + sum
}

export function accountsWithBalance(state: FinanceData, month: string | null = null): AccountWithBalance[] {
  return state.accounts.map((a) => ({
    ...a,
    balance: accountBalanceAsOf(a, state.transactions, month),
  }))
}

export function netWorthAsOf(state: FinanceData, month: string | null = null): number {
  return state.accounts.reduce(
    (sum, a) => sum + accountBalanceAsOf(a, state.transactions, month),
    0,
  )
}

export function monthlyGrowthRate(account: Account, transactions: Transaction[], month: string): number {
  const [prev] = monthsBack(month, 2)
  const cur = accountBalanceAsOf(account, transactions, month)
  const before = accountBalanceAsOf(account, transactions, prev)
  return fractionOf(cur - before, before)
}

export function netWorthSeries(state: FinanceData, n: number, endMonth: string): SparklineDatum[] {
  return monthsBack(endMonth, n).map((m) => ({
    label: shortMonthLabel(m),
    value: netWorthAsOf(state, m),
  }))
}

export function accountSeries(account: Account, transactions: Transaction[], n: number, endMonth: string): number[] {
  return monthsBack(endMonth, n).map((m) =>
    accountBalanceAsOf(account, transactions, m),
  )
}

export function categoryMap(categories: Category[]): Record<string, Category> {
  return Object.fromEntries(categories.map((c) => [c.id, c]))
}

export function categoryBreakdown(transactions: Transaction[], categories: Category[], month: string): CategoryBreakdownItem[] {
  const totals = new Map<string, number>()
  monthTransactions(transactions, month)
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + Math.abs(t.amount))
    })
  return categories
    .map((c) => ({ ...c, amount: totals.get(c.id) || 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

export function recentTransactions(state: FinanceData, n = 6): EnrichedTransaction[] {
  const cats = categoryMap(state.categories)
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, n)
    .map((t) => ({
      ...t,
      category: cats[t.categoryId]?.label ?? 'Sin categoría',
      icon: cats[t.categoryId]?.icon ?? 'package',
    }))
}
