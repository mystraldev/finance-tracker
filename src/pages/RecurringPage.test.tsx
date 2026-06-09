import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { availableTransactionMonths, listActivities, listTransactions } from '../data/financeRepository'
import { FinanceContext } from '../store/financeContext'
import type { FinanceContextValue, FinanceData } from '../types/finance'
import { recurringOccurrences } from '../utils/recurring'
import RecurringPage from './RecurringPage'

const data: FinanceData = {
  accounts: [
    {
      id: 'checking',
      name: 'Cuenta corriente',
      type: 'cash',
      icon: 'wallet',
      accent: 'indigo',
      openingBalance: 1000,
    },
  ],
  categories: [
    { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
    { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home' },
  ],
  transactions: [],
  transfers: [],
  recurringRules: [
    {
      id: 'rent',
      type: 'expense',
      description: 'Alquiler',
      amount: 850,
      dayOfMonth: 2,
      accountId: 'checking',
      categoryId: 'home',
      startMonth: '2026-06',
      active: true,
      frequency: 'monthly',
    },
  ],
  recurringSkips: [],
  savingsGoals: [],
}

function createValue(overrides: Partial<FinanceContextValue> = {}): FinanceContextValue {
  const state = { ...data, ...overrides }
  return {
    ...state,
    selectedMonth: '2026-06',
    getTransactions: (query) => listTransactions(state, query),
    getActivities: (query) => listActivities(state, query),
    getAvailableMonths: () => availableTransactionMonths(state),
    getRecurringOccurrences: (month) => recurringOccurrences(state, month),
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    addTransfer: vi.fn(),
    updateTransfer: vi.fn(),
    deleteTransfer: vi.fn(),
    addCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    addAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    addSavingsGoal: vi.fn(),
    updateSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
    addRecurringRule: vi.fn(),
    updateRecurringRule: vi.fn(),
    deleteRecurringRule: vi.fn(),
    confirmRecurringOccurrence: vi.fn(),
    skipRecurringOccurrence: vi.fn(),
    setMonth: vi.fn(),
    importData: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  }
}

function renderPage(value = createValue()) {
  render(
    <FinanceContext.Provider value={value}>
      <RecurringPage />
    </FinanceContext.Provider>,
  )
  return value
}

describe('RecurringPage', () => {
  it('shows pending recurring occurrences and confirms them', () => {
    const value = renderPage()

    expect(screen.getAllByText('Alquiler')).toHaveLength(2)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(value.confirmRecurringOccurrence).toHaveBeenCalledWith('rent', '2026-06')
  })
})
