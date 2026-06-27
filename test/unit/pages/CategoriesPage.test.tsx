import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { availableTransactionMonths, listTransactions } from '../../../src/data/financeRepository'
import { FinanceContext } from '../../../src/store/financeContext'
import type { FinanceContextValue, FinanceData } from '../../../src/types/finance'
import CategoriesPage from '../../../src/pages/CategoriesPage'

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
    { id: 'home', label: 'Vivienda', color: '#6366f1', icon: 'home', budget: 700 },
    { id: 'health', label: 'Salud', color: '#06b6d4', icon: 'health' },
  ],
  transactions: [
    {
      id: 't1',
      date: '2026-06-10',
      amount: -45,
      description: 'Farmacia',
      accountId: 'checking',
      categoryId: 'health',
    },
  ],
  savingsGoals: [],
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
    addSavingsGoal: vi.fn(),
    updateSavingsGoal: vi.fn(),
    deleteSavingsGoal: vi.fn(),
    setMonth: vi.fn(),
    importData: vi.fn(),
    reset: vi.fn(),
  }
}

function renderPage(value = createValue()) {
  render(
    <FinanceContext.Provider value={value}>
      <CategoriesPage />
    </FinanceContext.Provider>,
  )
  return value
}

describe('CategoriesPage', () => {
  it('shows a budget CTA for categories without a budget', () => {
    renderPage()

    expect(screen.getByText('Salud')).toBeInTheDocument()
    expect(screen.getByText('1 movimiento este mes')).toBeInTheDocument()
    expect(screen.getByText('45,00 €')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Definir presupuesto' })).toBeInTheDocument()
  })

  it('opens the category editor from the budget CTA', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Definir presupuesto' }))

    expect(screen.getByRole('heading', { name: 'Editar categoría' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Salud')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Sin límite')).toBeInTheDocument()
  })

  it('opens the create category modal', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Nueva categoría/i }))
    expect(screen.getByRole('heading', { name: 'Nueva categoría' })).toBeInTheDocument()
  })

  it('creates a new category', () => {
    const value = renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Nueva categoría/i }))
    fireEvent.change(screen.getByPlaceholderText('Ej. Suscripciones'), { target: { value: 'Ocio' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }))
    expect(value.addCategory).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Ocio' }),
    )
  })

  it('deletes a category after confirmation', () => {
    const value = renderPage()
    const deleteButtons = screen.getAllByLabelText('Borrar')
    fireEvent.click(deleteButtons[0])
    expect(screen.getByText('Borrar categoría')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Borrar categoría')).not.toBeInTheDocument()
  })

  it('blocks deletion of a category with transactions', () => {
    renderPage()
    const deleteButtons = screen.getAllByLabelText('Borrar')
    fireEvent.click(deleteButtons[1])

    expect(screen.getByText('No se puede borrar')).toBeInTheDocument()
    expect(screen.getByText(/tiene movimientos asociados/)).toBeInTheDocument()
  })

  it('shows budget progress for categories with a budget', () => {
    renderPage()
    expect(screen.getByText('Vivienda')).toBeInTheDocument()
    expect(screen.getByText('0 movimientos este mes')).toBeInTheDocument()
  })
})
