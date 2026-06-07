import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FINANCE_STORAGE_KEY } from '../data/financeRepository'
import { FinanceProvider } from './FinanceProvider'
import { useFinance } from './financeContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <FinanceProvider>{children}</FinanceProvider>
)

function setup() {
  return renderHook(() => useFinance(), { wrapper })
}

describe('FinanceProvider store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initialises from the seed', () => {
    const { result } = setup()
    expect(result.current.accounts.length).toBeGreaterThan(0)
    expect(result.current.categories.length).toBeGreaterThan(0)
    expect(result.current.transactions.length).toBeGreaterThan(0)
    expect(result.current.selectedMonth).toMatch(/^\d{4}-\d{2}$/)
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

  it('deletes a category', () => {
    const { result } = setup()
    const id = result.current.categories[0].id
    act(() => {
      result.current.deleteCategory(id)
    })
    expect(result.current.categories.some((c) => c.id === id)).toBe(false)
  })

  it('sets the selected month', () => {
    const { result } = setup()
    act(() => {
      result.current.setMonth('2025-01')
    })
    expect(result.current.selectedMonth).toBe('2025-01')
  })

  it('resets to the seed and persists to localStorage', () => {
    const { result } = setup()
    act(() => {
      result.current.deleteTransaction(result.current.transactions[0].id)
    })
    const reduced = result.current.transactions.length
    act(() => {
      result.current.reset()
    })
    expect(result.current.transactions.length).toBeGreaterThan(reduced)

    const raw = localStorage.getItem(FINANCE_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const persisted = JSON.parse(raw ?? '{}') as { transactions: unknown[] }
    expect(Array.isArray(persisted.transactions)).toBe(true)
  })
})
