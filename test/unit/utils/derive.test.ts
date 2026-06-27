import { describe, expect, it } from 'vitest'
import type { Account, Category, FinanceData, Transaction } from '../../../src/types/finance'
import {
  accountBalanceAsOf,
  accountSeries,
  accountsWithBalance,
  addMonths,
  availableMonths,
  categoryBreakdown,
  categoryBudgets,
  categoryMap,
  currentMonth,
  incomeExpenses,
  monthKey,
  monthLabel,
  monthTransactions,
  monthlyGrowthRate,
  monthsBack,
  netWorthAsOf,
  netWorthSeries,
  recentTransactions,
  shortMonthLabel,
} from '../../../src/utils/derive'

const accounts: Account[] = [
  { id: 'checking', name: 'Cuenta corriente', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 1000 },
  { id: 'savings', name: 'Ahorro', type: 'savings', icon: 'piggy', accent: 'emerald', openingBalance: 5000, interestRate: 0.02 },
]

const categories: Category[] = [
  { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
  { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home' },
  { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart' },
]

const transactions: Transaction[] = [
  { id: 't1', date: '2026-05-01', amount: 2000, description: 'Nómina', accountId: 'checking', categoryId: 'income' },
  { id: 't2', date: '2026-05-10', amount: -500, description: 'Alquiler', accountId: 'checking', categoryId: 'home' },
  { id: 't3', date: '2026-06-01', amount: 2000, description: 'Nómina', accountId: 'checking', categoryId: 'income' },
  { id: 't4', date: '2026-06-05', amount: -600, description: 'Alquiler', accountId: 'checking', categoryId: 'home' },
  { id: 't5', date: '2026-06-12', amount: -150, description: 'Compra', accountId: 'checking', categoryId: 'food' },
  { id: 't6', date: '2026-06-20', amount: -150, description: 'Compra 2', accountId: 'checking', categoryId: 'food' },
]

const data: FinanceData = { accounts, categories, transactions, savingsGoals: [] }

describe('month helpers', () => {
  it('monthKey extracts yyyy-mm', () => {
    expect(monthKey('2026-06-12')).toBe('2026-06')
  })

  it('currentMonth returns a yyyy-mm string', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/)
  })

  it('addMonths moves forward and backward across year boundaries', () => {
    expect(addMonths('2026-06', 1)).toBe('2026-07')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })

  it('monthsBack returns n consecutive months ending at endMonth', () => {
    expect(monthsBack('2026-06', 3)).toEqual(['2026-04', '2026-05', '2026-06'])
    expect(monthsBack('2026-01', 2)).toEqual(['2025-12', '2026-01'])
  })

  it('monthLabel and shortMonthLabel format in Spanish', () => {
    // Tolerant of ICU spelling/casing; monthLabel still capitalises its output.
    expect(monthLabel('2026-06')).toMatch(/junio.*2026/i)
    expect(monthLabel('2026-06')[0]).toBe(monthLabel('2026-06')[0].toUpperCase())
    expect(shortMonthLabel('2026-06')).toMatch(/^jun/i)
  })
})

describe('transaction selectors', () => {
  it('monthTransactions filters by month', () => {
    expect(monthTransactions(transactions, '2026-06')).toHaveLength(4)
    expect(monthTransactions(transactions, '2026-05')).toHaveLength(2)
    expect(monthTransactions(transactions, '2026-01')).toHaveLength(0)
  })

  it('availableMonths returns unique months newest-first', () => {
    expect(availableMonths(transactions)).toEqual(['2026-06', '2026-05'])
  })

  it('incomeExpenses sums income, expenses and savings', () => {
    expect(incomeExpenses(transactions, '2026-06')).toEqual({ income: 2000, expenses: 900, saved: 1100 })
    expect(incomeExpenses(transactions, '2026-05')).toEqual({ income: 2000, expenses: 500, saved: 1500 })
    expect(incomeExpenses(transactions, '2026-01')).toEqual({ income: 0, expenses: 0, saved: 0 })
  })
})

describe('balances and net worth', () => {
  it('accountBalanceAsOf adds opening balance to transactions up to a month', () => {
    expect(accountBalanceAsOf(accounts[0], transactions)).toBe(3600)
    expect(accountBalanceAsOf(accounts[0], transactions, '2026-05')).toBe(2500)
    expect(accountBalanceAsOf(accounts[1], transactions)).toBe(5000)
  })

  it('accountsWithBalance derives balance for each account', () => {
    const withBalance = accountsWithBalance(data)
    expect(withBalance.map((a) => a.balance)).toEqual([3600, 5000])
  })

  it('netWorthAsOf totals all accounts', () => {
    expect(netWorthAsOf(data)).toBe(8600)
    expect(netWorthAsOf(data, '2026-05')).toBe(7500)
    expect(netWorthAsOf(data, '2026-04')).toBe(6000)
  })

  it('monthlyGrowthRate is a fraction and is 0 when the previous balance is 0', () => {
    expect(monthlyGrowthRate(accounts[0], transactions, '2026-06')).toBeCloseTo(0.44, 5)
    expect(monthlyGrowthRate(accounts[1], transactions, '2026-06')).toBe(0)
    const empty: Account = { id: 'new', name: 'Nueva', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 0 }
    expect(monthlyGrowthRate(empty, transactions, '2026-06')).toBe(0)
  })

  it('monthlyGrowthRate keeps the sign of the change when the previous balance is negative', () => {
    const overdrawn: Account = { id: 'over', name: 'Descubierto', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: -1000 }
    const recovery = [
      { id: 'r1', date: '2026-06-10', amount: 500, description: 'Ingreso', accountId: 'over', categoryId: 'income' },
    ]
    // Balance goes from -1000 to -500: an improvement must be positive.
    expect(monthlyGrowthRate(overdrawn, recovery, '2026-06')).toBeCloseTo(0.5, 5)
  })
})

describe('sparkline series', () => {
  it('netWorthSeries returns labelled points', () => {
    const series = netWorthSeries(data, 3, '2026-06')
    expect(series.map((p) => p.value)).toEqual([6000, 7500, 8600])
    expect(series.map((p) => p.label)).toEqual(['abr', 'may', 'jun'])
  })

  it('accountSeries returns balances per month', () => {
    expect(accountSeries(accounts[0], transactions, 3, '2026-06')).toEqual([1000, 2500, 3600])
  })
})

describe('categories', () => {
  it('categoryMap indexes categories by id', () => {
    expect(categoryMap(categories).home.label).toBe('Vivienda')
  })

  it('categoryBreakdown groups expenses by category sorted desc, excluding income and zeros', () => {
    const breakdown = categoryBreakdown(transactions, categories, '2026-06')
    expect(breakdown.map((c) => [c.id, c.amount])).toEqual([
      ['home', 600],
      ['food', 300],
    ])
    expect(breakdown.find((c) => c.id === 'income')).toBeUndefined()
  })
})

describe('recentTransactions', () => {
  it('returns the latest transactions enriched with category label, icon and color', () => {
    const recent = recentTransactions(data, 3)
    expect(recent.map((t) => t.id)).toEqual(['t6', 't5', 't4'])
    expect(recent[0]).toMatchObject({
      category: 'Alimentación',
      icon: 'cart',
      color: '#10b981',
    })
  })

  it('falls back gracefully for an unknown category', () => {
    const orphan: FinanceData = {
      accounts,
      categories,
      savingsGoals: [],
      transactions: [{ id: 'x', date: '2026-06-30', amount: -10, description: 'Misterio', accountId: 'checking', categoryId: 'ghost' }],
    }
    expect(recentTransactions(orphan, 1)[0]).toMatchObject({
      category: 'Sin categoría',
      icon: 'package',
      color: '#64748b',
    })
  })
})

describe('categoryBudgets', () => {
  // June spend in the fixture: home 600, food 300, transport 0.
  const budgeted: Category[] = [
    { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' }, // no budget
    { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home', budget: 700 }, // 600/700 -> warning
    { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart', budget: 250 }, // 300/250 -> over
    { id: 'transport', label: 'Transporte', color: '#f59e0b', icon: 'car', budget: 200 }, // 0 -> ok
    { id: 'health', label: 'Salud', color: '#06b6d4', icon: 'health' }, // no budget
  ]

  it('computes status and remaining per budgeted category, sorted by usage', () => {
    const result = categoryBudgets(transactions, budgeted, '2026-06')
    expect(result.map((b) => b.id)).toEqual(['food', 'home', 'transport'])

    const food = result.find((b) => b.id === 'food')!
    expect(food).toMatchObject({ budget: 250, spent: 300, remaining: -50, status: 'over' })
    expect(food.pct).toBeCloseTo(1.2, 5)

    expect(result.find((b) => b.id === 'home')?.status).toBe('warning')
    expect(result.find((b) => b.id === 'transport')?.status).toBe('ok')
  })

  it('excludes categories without a budget', () => {
    const ids = categoryBudgets(transactions, budgeted, '2026-06').map((b) => b.id)
    expect(ids).not.toContain('income')
    expect(ids).not.toContain('health')
  })

  it('treats a month with no spend as ok', () => {
    const result = categoryBudgets(transactions, budgeted, '2026-04')
    expect(result.every((b) => b.status === 'ok' && b.spent === 0)).toBe(true)
  })
})
