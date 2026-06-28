import type { FinanceData, Transaction } from '../../../src/types/finance'
import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FINANCE_STORAGE_KEY } from '../../../src/data/financeRepo'
import { useFinance } from '../../../src/store/financeContext'
import { FinanceProvider } from '../../../src/store/FinanceProvider'

const wrapper = ({ children }: { children: ReactNode }) => <FinanceProvider>{children}</FinanceProvider>

function setup() {
  return renderHook(() => useFinance(), { wrapper })
}

function createFinanceData(transactions: Transaction[]): FinanceData {
  return {
    accounts: [
      {
        id: 'cash',
        name: 'Cash',
        type: 'cash',
        icon: 'wallet',
        accent: 'indigo',
        openingBalance: 0,
      },
    ],
    categories: [{ id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' }],
    transactions,
    savingsGoals: [],
  }
}

function transaction(id: string, date: string): Transaction {
  return {
    id,
    date,
    amount: 25,
    description: 'Income',
    accountId: 'cash',
    categoryId: 'income',
  }
}

describe('FinanceProvider store', () => {
  beforeEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('initialises from the seed', () => {
    const { result } = setup()
    expect(result.current.accounts.length).toBeGreaterThan(0)
    expect(result.current.categories.length).toBeGreaterThan(0)
    expect(result.current.transactions.length).toBeGreaterThan(0)
    expect(result.current.selectedMonth).toMatch(/^\d{4}-\d{2}$/)
  })

  it('initialises to the current month when it has transactions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-09T00:00:00.000Z'))
    const data = createFinanceData([transaction('june', '2026-06-09'), transaction('future', '2026-07-01')])
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data))

    const { result } = setup()

    expect(result.current.selectedMonth).toBe('2026-06')
  })

  it('initialises to the latest available month when the current month is empty', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-09T00:00:00.000Z'))
    const data = createFinanceData([transaction('may', '2026-05-09'), transaction('june', '2026-06-09')])
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data))

    const { result } = setup()

    expect(result.current.selectedMonth).toBe('2026-06')
  })

  it('keeps the current month when there are no transactions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-09T00:00:00.000Z'))
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(createFinanceData([])))

    const { result } = setup()

    expect(result.current.selectedMonth).toBe('2026-07')
  })

  it('adds a transaction with a generated id', () => {
    const { result } = setup()
    const before = result.current.transactions.length
    act(() => {
      result.current.addTransaction({
        date: '2026-06-15',
        amount: -10,
        description: 'Test',
        accountId: result.current.accounts[0].id,
        categoryId: result.current.categories[1].id,
      })
    })
    expect(result.current.transactions).toHaveLength(before + 1)
    const added = result.current.transactions.at(-1)
    expect(added?.id).toBeTruthy()
    expect(added?.amount).toBe(-10)
  })

  it('exposes repository-backed transaction queries', () => {
    const { result } = setup()

    expect(
      result.current.getTransactions({
        month: '2026-06',
        type: 'income',
        sort: 'date-desc',
      }),
    ).toHaveLength(1)
    expect(result.current.getAvailableMonths()[0]).toBe('2026-06')
  })

  it('deletes an unused category', () => {
    const { result } = setup()
    act(() => {
      result.current.addCategory({
        label: 'Unused',
        color: '#6366f1',
        icon: 'home',
      })
    })
    const id = result.current.categories.at(-1)?.id

    expect(id).toBeTruthy()

    act(() => {
      result.current.deleteCategory(id ?? '')
    })
    expect(result.current.categories.some((c) => c.id === id)).toBe(false)
  })

  it('keeps categories referenced by transactions', () => {
    const { result } = setup()
    const id = result.current.transactions[0].categoryId

    act(() => {
      result.current.deleteCategory(id)
    })

    expect(result.current.categories.some((c) => c.id === id)).toBe(true)
  })

  it('keeps accounts referenced by transactions', () => {
    const { result } = setup()
    const id = result.current.transactions[0].accountId

    act(() => {
      result.current.deleteAccount(id)
    })

    expect(result.current.accounts.some((a) => a.id === id)).toBe(true)
  })

  it('deletes an unused account', () => {
    const { result } = setup()
    act(() => {
      result.current.addAccount({
        name: 'Unused',
        type: 'cash',
        icon: 'wallet',
        accent: 'indigo',
        openingBalance: 0,
      })
    })
    const id = result.current.accounts.at(-1)?.id

    expect(id).toBeTruthy()

    act(() => {
      result.current.deleteAccount(id ?? '')
    })
    expect(result.current.accounts.some((a) => a.id === id)).toBe(false)
  })

  it('creates, updates and deletes a savings goal', () => {
    const { result } = setup()

    act(() => {
      result.current.addSavingsGoal({
        name: 'Emergency fund',
        targetAmount: 1000,
        savedAmount: 100,
        icon: 'piggy',
        color: '#10b981',
        accountId: result.current.accounts[0].id,
      })
    })

    const added = result.current.savingsGoals.at(-1)
    expect(added).toEqual(
      expect.objectContaining({
        name: 'Emergency fund',
        savedAmount: 100,
      }),
    )

    act(() => {
      result.current.updateSavingsGoal({ id: added?.id ?? '', savedAmount: 250 })
    })
    expect(result.current.savingsGoals.find((goal) => goal.id === added?.id)?.savedAmount).toBe(250)

    act(() => {
      result.current.deleteSavingsGoal(added?.id ?? '')
    })
    expect(result.current.savingsGoals.some((goal) => goal.id === added?.id)).toBe(false)
  })

  it('keeps accounts referenced by savings goals', () => {
    const { result } = setup()
    act(() => {
      result.current.addAccount({
        name: 'Goal account',
        type: 'cash',
        icon: 'wallet',
        accent: 'indigo',
        openingBalance: 100,
      })
    })
    const id = result.current.accounts.at(-1)?.id ?? ''

    act(() => {
      result.current.addSavingsGoal({
        name: 'Linked goal',
        targetAmount: 100,
        savedAmount: 50,
        icon: 'piggy',
        color: '#10b981',
        accountId: id,
      })
    })
    act(() => {
      result.current.deleteAccount(id)
    })

    expect(result.current.accounts.some((account) => account.id === id)).toBe(true)
  })

  it('sets the selected month', () => {
    const { result } = setup()
    act(() => {
      result.current.setMonth('2025-01')
    })
    expect(result.current.selectedMonth).toBe('2025-01')
  })

  it('imports validated finance data and persists it', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-09T00:00:00.000Z'))
    const { result } = setup()
    const imported = {
      accounts: [
        {
          id: 'cash',
          name: 'Cash',
          type: 'cash' as const,
          icon: 'wallet',
          accent: 'indigo',
          openingBalance: 25,
        },
      ],
      categories: [{ id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' }],
      transactions: [
        {
          id: 't-imported',
          date: '2026-06-09',
          amount: 25,
          description: 'Imported',
          accountId: 'cash',
          categoryId: 'income',
        },
      ],
      savingsGoals: [
        {
          id: 'goal-imported',
          name: 'Imported goal',
          targetAmount: 100,
          savedAmount: 25,
          icon: 'piggy',
          color: '#10b981',
          accountId: 'cash',
        },
      ],
    }

    act(() => {
      result.current.importData(imported)
    })

    expect(result.current.accounts).toEqual(imported.accounts)
    expect(result.current.transactions).toEqual(imported.transactions)
    expect(result.current.savingsGoals).toEqual(imported.savingsGoals)
    expect(result.current.selectedMonth).toBe('2026-06')

    const raw = localStorage.getItem(FINANCE_STORAGE_KEY)
    expect(JSON.parse(raw ?? '{}')).toEqual(imported)
  })

  it('resets to the seed and persists to localStorage', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-09T00:00:00.000Z'))
    const { result } = setup()
    act(() => {
      result.current.deleteTransaction(result.current.transactions[0].id)
    })
    const reduced = result.current.transactions.length
    act(() => {
      result.current.reset()
    })
    expect(result.current.transactions.length).toBeGreaterThan(reduced)
    expect(result.current.selectedMonth).toBe('2026-06')

    const raw = localStorage.getItem(FINANCE_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const persisted = JSON.parse(raw ?? '{}') as { transactions: unknown[] }
    expect(Array.isArray(persisted.transactions)).toBe(true)
  })
})
