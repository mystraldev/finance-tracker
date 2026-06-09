import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { availableTransactionMonths, listTransactions } from '../data/financeRepository'
import { FinanceContext } from '../store/financeContext'
import type { FinanceContextValue, FinanceData } from '../types/finance'
import TransactionsPage from './TransactionsPage'

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
  categories: [
    { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
    { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home' },
    { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart' },
  ],
  transactions: [
    { id: 't1', date: '2026-06-01', amount: 2000, description: 'Nómina', accountId: 'checking', categoryId: 'income' },
    { id: 't2', date: '2026-06-05', amount: -600, description: 'Alquiler', accountId: 'checking', categoryId: 'home' },
    { id: 't3', date: '2026-06-12', amount: -150, description: 'Compra semanal', accountId: 'savings', categoryId: 'food' },
  ],
}

function createValue(overrides: Partial<FinanceData> = {}): FinanceContextValue {
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
    setMonth: vi.fn(),
    importData: vi.fn(),
    reset: vi.fn(),
  }
}

function renderPage(value = createValue()) {
  return render(
    <FinanceContext.Provider value={value}>
      <TransactionsPage />
    </FinanceContext.Provider>,
  )
}

describe('TransactionsPage', () => {
  it('filters transactions from the search box and updates the summary', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Buscar movimientos'), {
      target: { value: 'alquiler' },
    })

    expect(screen.getByText('Alquiler')).toBeInTheDocument()
    expect(screen.queryByText('Nómina')).not.toBeInTheDocument()
    expect(screen.queryByText('Compra semanal')).not.toBeInTheDocument()

    const summary = within(screen.getByLabelText('Resumen filtrado'))
    expect(summary.getByText('Movimientos')).toBeInTheDocument()
    expect(summary.getByText('1')).toBeInTheDocument()
    expect(summary.getByText('600,00 €')).toBeInTheDocument()
  })

  it('clears filters and restores the full result set', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Buscar movimientos'), {
      target: { value: 'alquiler' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }))

    expect(screen.getByText('Nómina')).toBeInTheDocument()
    expect(screen.getByText('Alquiler')).toBeInTheDocument()
    expect(screen.getByText('Compra semanal')).toBeInTheDocument()
  })

  it('shows a filtered empty state when no result matches', () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('Buscar movimientos'), {
      target: { value: 'zzz' },
    })

    expect(screen.getByText('No hay movimientos con estos filtros.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument()
  })

  it('shows a plain empty state when there are no transactions', () => {
    renderPage(createValue({ transactions: [] }))

    expect(screen.getByText('Todavía no hay movimientos.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument()
  })
})
