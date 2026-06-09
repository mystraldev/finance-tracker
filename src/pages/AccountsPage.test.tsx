import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { availableTransactionMonths, listActivities, listTransactions } from '../data/financeRepository'
import { FinanceContext } from '../store/financeContext'
import type { FinanceContextValue, FinanceData } from '../types/finance'
import AccountsPage from './AccountsPage'

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
    {
      id: 'savings',
      name: 'Ahorro',
      type: 'savings',
      icon: 'piggy',
      accent: 'emerald',
      openingBalance: 5000,
    },
  ],
  categories: [{ id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' }],
  transactions: [],
  transfers: [],
  recurringRules: [],
  recurringSkips: [],
  savingsGoals: [
    {
      id: 'goal-1',
      name: 'Fondo de emergencia',
      targetAmount: 6000,
      savedAmount: 2400,
      icon: 'piggy',
      color: '#10b981',
      accountId: 'savings',
    },
  ],
}

function createValue(overrides: Partial<FinanceContextValue> = {}): FinanceContextValue {
  const state = { ...data, ...overrides }
  return {
    ...state,
    selectedMonth: '2026-06',
    getTransactions: (query) => listTransactions(state, query),
    getActivities: (query) => listActivities(state, query),
    getAvailableMonths: () => availableTransactionMonths(state),
    getRecurringOccurrences: vi.fn(() => []),
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
      <AccountsPage />
    </FinanceContext.Provider>,
  )
  return value
}

describe('AccountsPage', () => {
  it('shows savings goals on the accounts page', () => {
    renderPage()

    expect(screen.getByText('Objetivos de ahorro')).toBeInTheDocument()
    expect(screen.getByText('Fondo de emergencia')).toBeInTheDocument()
    expect(screen.getByRole('meter', {
      name: /Fondo de emergencia: 2400,00\s€ de 6000,00\s€/,
    })).toBeInTheDocument()
  })

  it('creates a linked savings goal', () => {
    const value = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo objetivo' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Viaje' } })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '3000' } })
    fireEvent.change(screen.getByLabelText('Reservado'), { target: { value: '850' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'checking' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear objetivo' }))

    expect(value.addSavingsGoal).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Viaje',
      targetAmount: 3000,
      savedAmount: 850,
      accountId: 'checking',
    }))
  })

  it('rejects a linked goal that exceeds the account available balance', () => {
    const value = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo objetivo' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Entrada' } })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '3000' } })
    fireEvent.change(screen.getByLabelText('Reservado'), { target: { value: '2000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'checking' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear objetivo' }))

    expect(screen.getByText(/Esta cuenta solo tiene 1000,00\s€ disponible para reservar\./)).toBeInTheDocument()
    expect(value.addSavingsGoal).not.toHaveBeenCalled()
  })
})
