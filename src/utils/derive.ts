import type { Account, AccountWithBalance, BudgetStatus, Category, CategoryBreakdownItem, CategoryBudget, EnrichedTransaction, FinanceData, SparklineDatum, Transaction } from '../types/finance'

import { availableTransactionMonths, listTransactions, transactionMonthKey } from '../data/financeRepo'
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
  for (let index = n - 1; index >= 0; index--) {
    const d = new Date(Date.UTC(y, m - 1 - index, 1))
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
    { accounts: [], categories: [], transactions, savingsGoals: [] },
    { month },
  )
}

export function availableMonths(transactions: Transaction[]): string[] {
  return availableTransactionMonths({ accounts: [], categories: [], transactions, savingsGoals: [] })
}

export function incomeExpenses(transactions: Transaction[], month: string): { income: number; expenses: number; saved: number } {
  const m = monthTransactions(transactions, month)
  const income = m.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = m
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expenses, saved: income - expenses }
}

export type SavingsSummary = {
  /** Real income (transactions in income-flagged categories). */
  salary: number
  /** Spending minus reimbursements (non-income money coming in). */
  netExpenses: number
  saved: number
  /** Whether any category is marked as income. */
  configured: boolean
}

/**
 * Savings relative to real income. Non-income positive amounts (Bizum, shared
 * rent, ...) are treated as reimbursements that offset expenses rather than as
 * income, so the rate is tied to the salary and the figures reconcile.
 */
export function savingsSummary(transactions: Transaction[], categories: Category[], month: string): SavingsSummary {
  const incomeCategoryIds = new Set(categories.filter((c) => c.isIncome).map((c) => c.id))
  let salary = 0
  let grossExpenses = 0
  let reimbursements = 0

  for (const t of monthTransactions(transactions, month)) {
    if (t.amount < 0) {
      grossExpenses += Math.abs(t.amount)
    } else if (incomeCategoryIds.has(t.categoryId)) {
      salary += t.amount
    } else {
      reimbursements += t.amount
    }
  }

  const netExpenses = grossExpenses - reimbursements
  return { salary, netExpenses, saved: salary - netExpenses, configured: incomeCategoryIds.size > 0 }
}

export function accountBalanceAsOf(account: Account, transactions: Transaction[], month?: string): number {
  const sum = transactions
    .filter((t) => t.accountId === account.id && (!month || monthKey(t.date) <= month))
    .reduce((s, t) => s + t.amount, 0)
  return account.openingBalance + sum
}

export function accountsWithBalance(state: FinanceData, month?: string): AccountWithBalance[] {
  return state.accounts.map((a) => ({
    ...a,
    balance: accountBalanceAsOf(a, state.transactions, month),
  }))
}

export function netWorthAsOf(state: FinanceData, month?: string): number {
  return state.accounts.reduce(
    (sum, a) => sum + accountBalanceAsOf(a, state.transactions, month),
    0,
  )
}

export function monthlyGrowthRate(account: Account, transactions: Transaction[], month: string): number {
  const [previous] = monthsBack(month, 2)
  const current = accountBalanceAsOf(account, transactions, month)
  const before = accountBalanceAsOf(account, transactions, previous)
  // Divide by |before| so the sign always reflects the direction of change,
  // even when the previous balance was negative.
  return fractionOf(current - before, Math.abs(before))
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
  const monthExpenses = monthTransactions(transactions, month).filter((t) => t.amount < 0)
  for (const t of monthExpenses) {
    totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + Math.abs(t.amount))
  }
  return categories
    .map((c) => ({ ...c, amount: totals.get(c.id) || 0 }))
    .filter((c) => c.amount > 0)
    .toSorted((a, b) => b.amount - a.amount)
}

/** Spend vs budget for each budgeted category in a month, sorted by usage desc.
 *  Categories without a budget are excluded. `pct` may exceed 1 when over budget. */
export function categoryBudgets(transactions: Transaction[], categories: Category[], month: string): CategoryBudget[] {
  const spentByCat = new Map<string, number>()
  const monthExpenses = monthTransactions(transactions, month).filter((t) => t.amount < 0)
  for (const t of monthExpenses) {
    spentByCat.set(t.categoryId, (spentByCat.get(t.categoryId) || 0) + Math.abs(t.amount))
  }

  return categories
    .filter((c): c is Category & { budget: number } => typeof c.budget === 'number' && c.budget > 0)
    .map((c) => {
      const spent = spentByCat.get(c.id) || 0
      const pct = fractionOf(spent, c.budget)
      let status: BudgetStatus
      if (spent > c.budget) {
        status = 'over'
      } else if (pct >= BUDGET_WARNING_RATIO) {
        status = 'warning'
      } else {
        status = 'ok'
      }
      return { ...c, budget: c.budget, spent, remaining: c.budget - spent, pct, status }
    })
    .toSorted((a, b) => b.pct - a.pct)
}

export function recentTransactions(state: FinanceData, n = 6): EnrichedTransaction[] {
  const cats = categoryMap(state.categories)
  return listTransactions(state, { sort: 'date-desc', limit: n })
    .map((t) => ({
      ...t,
      category: cats[t.categoryId]?.label ?? 'Sin categoría',
      icon: cats[t.categoryId]?.icon ?? 'package',
      color: cats[t.categoryId]?.color ?? '#64748b',
    }))
}
