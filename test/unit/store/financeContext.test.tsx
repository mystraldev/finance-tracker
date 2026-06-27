import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { FinanceContext } from '../../../src/store/financeContext'
import { useFinance } from '../../../src/store/financeContext'

const value = {
  accounts: [],
  categories: [],
  transactions: [],
  savingsGoals: [],
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  addAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  addSavingsGoal: vi.fn(),
  updateSavingsGoal: vi.fn(),
  deleteSavingsGoal: vi.fn(),
  selectedMonth: '2026-06',
  setSelectedMonth: vi.fn(),
  importData: vi.fn(),
  resetToSeed: vi.fn(),
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
)

describe('useFinance', () => {
  it('returns the context value when used inside a provider', () => {
    const { result } = renderHook(() => useFinance(), { wrapper })
    expect(result.current.accounts).toEqual([])
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useFinance())).toThrow()
  })
})
