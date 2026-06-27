import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { FinanceContext } from '../../../src/store/financeContext'
import AddTransactionButton from '../../../src/components/AddTransactionButton'
import type { FinanceContextValue } from '../../../src/types/finance'

const baseValue: FinanceContextValue = {
  accounts: [{ id: 'checking', name: 'Cuenta corriente', type: 'cash', icon: 'wallet', accent: 'indigo', openingBalance: 1500 }],
  categories: [{ id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' }],
  transactions: [],
  savingsGoals: [],
  selectedMonth: '2026-06',
  getTransactions: vi.fn(),
  getAvailableMonths: vi.fn().mockReturnValue(['2026-06']),
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
  setMonth: vi.fn(),
  importData: vi.fn(),
  reset: vi.fn(),
}

function renderButton() {
  return render(
    <FinanceContext.Provider value={baseValue}>
      <AddTransactionButton />
    </FinanceContext.Provider>,
  )
}

describe('AddTransactionButton', () => {
  it('renders a button with the default label', () => {
    renderButton()
    expect(screen.getByText('Añadir movimiento')).toBeInTheDocument()
  })

  it('renders an SVG icon', () => {
    const { container } = renderButton()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('opens the modal when clicked', () => {
    renderButton()
    fireEvent.click(screen.getByText('Añadir movimiento'))
    expect(screen.getByText('Nuevo movimiento')).toBeInTheDocument()
  })
})
