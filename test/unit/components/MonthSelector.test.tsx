import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FinanceContext } from '../../../src/store/financeContext'
import MonthSelector from '../../../src/components/MonthSelector'
import type { FinanceContextValue } from '../../../src/types/finance'

function renderSelector(selectedMonth = '2026-06') {
  const setMonth = vi.fn()
  const value: FinanceContextValue = {
    accounts: [],
    categories: [],
    transactions: [],
    savingsGoals: [],
    selectedMonth,
    getTransactions: vi.fn(),
    getAvailableMonths: vi.fn(),
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
    setMonth,
    importData: vi.fn(),
    reset: vi.fn(),
  }
  const result = render(
    <FinanceContext.Provider value={value}>
      <MonthSelector />
    </FinanceContext.Provider>,
  )
  return { ...result, setMonth }
}

describe('MonthSelector', () => {
  it('renders the given month', () => {
    renderSelector('2026-06')
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('calls setMonth when navigating forward', () => {
    const { setMonth } = renderSelector('2026-06')
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(setMonth).toHaveBeenCalledOnce()
  })

  it('calls setMonth when navigating backward', () => {
    const { setMonth } = renderSelector('2026-06')
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(setMonth).toHaveBeenCalledOnce()
  })
})
