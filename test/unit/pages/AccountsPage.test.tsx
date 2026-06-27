import type { FinanceContextValue, FinanceData } from '../../../src/types/finance'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { availableTransactionMonths, listTransactions } from '../../../src/data/financeRepo'
import AccountsPage from '../../../src/pages/AccountsPage'
import { FinanceContext } from '../../../src/store/financeContext'

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
    getAvailableMonths: () => availableTransactionMonths(state),
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    addCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    addAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    addSavingsGoal: vi.fn(),
    updateSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
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

  it('renders account cards in the grid', () => {
    renderPage()
    expect(screen.getByText('Cuenta corriente')).toBeInTheDocument()
    const accountCards = screen.getAllByText('Ahorro')
    expect(accountCards.length).toBeGreaterThanOrEqual(1)
  })

  it('opens the edit account modal', () => {
    renderPage()
    const editButtons = screen.getAllByLabelText('Editar')
    fireEvent.click(editButtons[0])
    expect(screen.getByText('Editar cuenta')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cuenta corriente')).toBeInTheDocument()
  })

  it('blocks deletion of an account with transactions', () => {
    const dataWithTxs: FinanceData = {
      ...data,
      savingsGoals: [],
      transactions: [
        { id: 'tx-1', date: '2026-06-01', amount: -50, description: 'Gasto', accountId: 'checking', categoryId: 'income' },
      ],
    }
    renderPage(createValue(dataWithTxs))

    const deleteButtons = screen.getAllByLabelText('Borrar')
    fireEvent.click(deleteButtons[0])
    expect(screen.getByText('No se puede borrar')).toBeInTheDocument()
    expect(screen.getByText(/tiene movimientos u objetivos asociados/)).toBeInTheDocument()
  })

  it('shows a delete confirmation for an unused account', () => {
    const _value = renderPage(createValue({ ...data, savingsGoals: [] }))

    const deleteButtons = screen.getAllByLabelText('Borrar')
    fireEvent.click(deleteButtons[1])

    expect(screen.getByText('Borrar cuenta')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Borrar cuenta')).not.toBeInTheDocument()
  })

  it('opens the edit savings goal modal', () => {
    renderPage()
    const editGoalButton = screen.getByLabelText('Editar objetivo Fondo de emergencia')
    fireEvent.click(editGoalButton)
    expect(screen.getByText('Editar objetivo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fondo de emergencia')).toBeInTheDocument()
  })

  it('shows a delete confirmation for a savings goal', () => {
    const _value = renderPage()
    const deleteGoalButton = screen.getByLabelText('Borrar objetivo Fondo de emergencia')
    fireEvent.click(deleteGoalButton)
    expect(screen.getByText('Borrar objetivo')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Borrar objetivo')).not.toBeInTheDocument()
  })

  it('shows a completed goal badge', () => {
    const dataWithComplete: FinanceData = {
      ...data,
      savingsGoals: [
        {
          id: 'done',
          name: 'Meta cumplida',
          targetAmount: 500,
          savedAmount: 500,
          icon: 'piggy',
          color: '#10b981',
          accountId: 'savings',
        },
      ],
    }
    renderPage(createValue(dataWithComplete))
    const badges = screen.getAllByText('Completado')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when there are no savings goals', () => {
    renderPage(createValue({ accounts: data.accounts, categories: data.categories, transactions: [], savingsGoals: [] }))
    expect(screen.getByText('Todavía no hay objetivos.')).toBeInTheDocument()
  })
})
