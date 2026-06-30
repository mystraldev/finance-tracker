import type { Account, Category } from '../../../src/types/finance'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TransactionForm from '../../../src/components/TransactionForm'

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
        onCancel={() => {}}
        onSubmit={onSubmit}
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
        onCancel={() => {}}
        onSubmit={onSubmit}
      />,
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-06-10' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ date: '2026-06-10', amount: -12.5 }),
    )
  })

  it('rejects submission with an empty amount', () => {
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onCancel={() => {}}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))
    expect(screen.getByText('Introduce un importe válido mayor que 0.')).toBeInTheDocument()
  })

  it('rejects submission without a description', () => {
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onCancel={() => {}}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '50' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))
    expect(screen.getByText('Añade una descripción.')).toBeInTheDocument()
  })

  it('submits an income transaction with positive amount', () => {
    const onSubmit = vi.fn()
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onCancel={() => {}}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByText('Ingreso'))
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '2500' } })
    fireEvent.change(screen.getByPlaceholderText('Ej. Compra semanal'), { target: { value: 'Nómina' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2500, categoryId: 'income' }),
    )
  })

  it('rejects submission without an account', () => {
    render(
      <TransactionForm
        accounts={[]}
        categories={categories}
        onCancel={() => {}}
        onSubmit={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '50' } })
    fireEvent.change(screen.getByPlaceholderText('Ej. Compra semanal'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByRole('button', { name: /Añadir movimiento/i }))
    expect(screen.getByText('Selecciona una cuenta.')).toBeInTheDocument()
  })

  it('shows the category field for income as well as expenses', () => {
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        onCancel={() => {}}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText('Categoría')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Ingreso'))
    expect(screen.getByText('Categoría')).toBeInTheDocument()
  })

  it('pre-fills fields when editing a transaction', () => {
    render(
      <TransactionForm
        accounts={accounts}
        categories={categories}
        initial={{
          id: 'tx-1',
          date: '2026-06-15',
          amount: -75,
          description: 'Gasolina',
          accountId: 'checking',
          categoryId: 'food',
        }}
        onCancel={() => {}}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('Ej. Compra semanal')).toHaveValue('Gasolina')
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument()
  })
})
