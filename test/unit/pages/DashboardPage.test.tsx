import type { FinanceContextValue } from '../../../src/types/finance'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import DashboardPage from '../../../src/pages/DashboardPage'
import { FinanceContext } from '../../../src/store/financeContext'

const value: FinanceContextValue = {
  accounts: [
    { id: 'checking', name: 'Cuenta corriente', type: 'cash' as const, icon: 'wallet', accent: 'indigo', openingBalance: 1500 },
    { id: 'savings', name: 'Cuenta remunerada', type: 'savings' as const, icon: 'piggy', accent: 'emerald', openingBalance: 12_500, interestRate: 0.0275 },
    { id: 'investments', name: 'Inversiones', type: 'investment' as const, icon: 'trending', accent: 'violet', openingBalance: 18_340.18 },
  ],
  categories: [
    { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
    { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart', budget: 400 },
  ],
  transactions: [
    { id: 'txn-1', date: '2026-06-15', amount: 2500, description: 'Nómina', accountId: 'checking', categoryId: 'income' },
    { id: 'txn-2', date: '2026-06-16', amount: -45, description: 'Supermercado', accountId: 'checking', categoryId: 'food' },
    { id: 'txn-3', date: '2026-06-17', amount: -80, description: 'Gasolina', accountId: 'checking', categoryId: 'food' },
  ],
  savingsGoals: [],
  selectedMonth: '2026-06',
  getTransactions: vi.fn(),
  getAvailableMonths: vi.fn().mockReturnValue(['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']),
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

function renderPage() {
  return render(
    <FinanceContext.Provider value={value}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </FinanceContext.Provider>,
  )
}

describe('DashboardPage', () => {
  it('renders the dashboard title', () => {
    renderPage()
    expect(screen.getByText('Tu resumen financiero')).toBeInTheDocument()
  })

  it('renders the greeting', () => {
    renderPage()
    expect(screen.getByText('Hola, Ferran')).toBeInTheDocument()
  })

  it('renders account summary cards', () => {
    renderPage()
    const items = screen.getAllByText('Cuenta remunerada')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('renders recent transactions', () => {
    renderPage()
    expect(screen.getByText('Movimientos recientes')).toBeInTheDocument()
  })

  it('renders the savings rate', () => {
    renderPage()
    expect(screen.getByText('Tasa de ahorro')).toBeInTheDocument()
  })

  it('renders category breakdown', () => {
    renderPage()
    expect(screen.getByText('Gastos por categoría')).toBeInTheDocument()
  })

  it('renders budget progress', () => {
    renderPage()
    expect(screen.getByText('Presupuestos')).toBeInTheDocument()
  })

  it('renders a month selector', () => {
    renderPage()
    const items = screen.getAllByText(/2026/)
    expect(items.length).toBeGreaterThanOrEqual(1)
  })
})
