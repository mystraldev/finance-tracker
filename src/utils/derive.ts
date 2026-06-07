import type { Account, AccountWithBalance, BudgetStatus, Category, CategoryBreakdownItem, CategoryBudget, EnrichedTransaction, FinanceData, SparklineDatum, Transaction } from '../types/finance'
import { availableTransactionMonths, listTransactions, transactionMonthKey } from '../data/financeRepository'
import { fractionOf } from './math'

const BUDGET_WARNING_RATIO = 0.8

export function monthKey(date: string): string {
  return transactionMonthKey(date)
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
  return listTransactions(
    { accounts: [], categories: [], transactions },
    { month },
  )
}

export function availableMonths(transactions: Transaction[]): string[] {
  return availableTransactionMonths({ accounts: [], categories: [], transactions })
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

/** Spend vs budget for each budgeted category in a month, sorted by usage desc.
 *  Categories without a budget are excluded. `pct` may exceed 1 when over budget. */
export function categoryBudgets(transactions: Transaction[], categories: Category[], month: string): CategoryBudget[] {
  const spentByCat = new Map<string, number>()
  monthTransactions(transactions, month)
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      spentByCat.set(t.categoryId, (spentByCat.get(t.categoryId) || 0) + Math.abs(t.amount))
    })

  return categories
    .filter((c): c is Category & { budget: number } => typeof c.budget === 'number' && c.budget > 0)
    .map((c) => {
      const spent = spentByCat.get(c.id) || 0
      const pct = fractionOf(spent, c.budget)
      const status: BudgetStatus =
        spent > c.budget ? 'over' : pct >= BUDGET_WARNING_RATIO ? 'warning' : 'ok'
      return { ...c, budget: c.budget, spent, remaining: c.budget - spent, pct, status }
    })
    .sort((a, b) => b.pct - a.pct)
}

export function recentTransactions(state: FinanceData, n = 6): EnrichedTransaction[] {
  const cats = categoryMap(state.categories)
  return listTransactions(state, { sort: 'date-desc', limit: n })
    .map((t) => ({
      ...t,
      category: cats[t.categoryId]?.label ?? 'Sin categoría',
      icon: cats[t.categoryId]?.icon ?? 'package',
    }))
}
