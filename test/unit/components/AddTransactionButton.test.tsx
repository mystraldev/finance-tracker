import type { FinanceContextValue } from '../../../src/types/finance'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import AddTransactionButton from '../../../src/components/AddTransactionButton'
import { FinanceContext } from '../../../src/store/financeContext'

function createValue(): FinanceContextValue {
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
    categories: [
      { id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' },
      { id: 'food', label: 'Food', color: '#10b981', icon: 'cart' },
    ],
    transactions: [],
    savingsGoals: [],
    selectedMonth: '2026-06',
    getTransactions: vi.fn(),
    getAvailableMonths: vi.fn(),
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
  }
}

function renderButton(label?: string) {
  const value = createValue()
  render(
    <FinanceContext.Provider value={value}>
      <AddTransactionButton label={label} />
    </FinanceContext.Provider>,
  )
  return value
}

describe('AddTransactionButton', () => {
  it('renders with default label', () => {
    renderButton()
    expect(screen.getByText('Añadir movimiento')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    renderButton('Nuevo ingreso')
    expect(screen.getByText('Nuevo ingreso')).toBeInTheDocument()
  })

  it('opens the modal on click', () => {
    renderButton()
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Nuevo movimiento')).toBeInTheDocument()
  })

  it('closes the modal on cancel', () => {
    renderButton()
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls addTransaction on valid submit', () => {
    const value = renderButton()
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))

    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100' } })
    fireEvent.change(screen.getByPlaceholderText('Ej. Compra semanal'), {
      target: { value: 'Test' },
    })
    const submitButton = screen.getByRole('dialog').querySelector('button[type="submit"]')!
    fireEvent.click(submitButton)

    expect(value.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: -100, description: 'Test' }),
    )
  })
})
