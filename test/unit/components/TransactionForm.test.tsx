import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import TransactionForm from '../../../src/components/TransactionForm'
import type { Account, Category } from '../../../src/types/finance'

const accounts: Account[] = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash',
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 1000,
  },
]

const categories: Category[] = [
  { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
  { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart' },
]

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '12,50' } })
  fireEvent.change(screen.getByPlaceholderText('Ej. Compra semanal'), {
    target: { value: 'Supermercado' },
  })
}

describe('TransactionForm', () => {
  it('rejects submission when the date is empty', () => {
    const onSubmit = vi.fn()
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Selecciona una fecha.')).toBeInTheDocument()
  })

  it('submits when the date is valid', () => {
    const onSubmit = vi.fn()
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-06-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-06-10', amount: -12.5 }),
    )
  })
})
