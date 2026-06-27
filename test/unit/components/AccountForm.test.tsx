import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountForm from '../../../src/components/AccountForm'
import type { Account } from '../../../src/types/finance'

const savingsAccount: Account = {
  id: 'savings',
  name: 'Cuenta remunerada',
  type: 'savings',
  icon: 'piggy',
  accent: 'emerald',
  openingBalance: 1000,
  interestRate: 0.0275,
}

describe('AccountForm', () => {
  it('clears interestRate when a savings account changes type', () => {
    const onSubmit = vi.fn()
    render(<AccountForm initial={savingsAccount} onSubmit={onSubmit} onCancel={() => {}} />)

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'cash' } })
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      id: 'savings',
      type: 'cash',
      interestRate: undefined,
    }))
  })

  it('shows validation error when name is empty', () => {
    const onSubmit = vi.fn()
    render(<AccountForm onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))
    expect(screen.getByText('Ponle un nombre a la cuenta.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows interest rate field for savings type', () => {
    render(<AccountForm onSubmit={vi.fn()} onCancel={() => {}} />)
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'savings' } })
    expect(screen.getByText('Interés (TAE)')).toBeInTheDocument()
  })

  it('submits a new account', () => {
    const onSubmit = vi.fn()
    render(<AccountForm onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. Cuenta nómina'), { target: { value: 'Nómina' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nómina', type: 'cash' }),
    )
  })

  it('submits without id when creating', () => {
    const onSubmit = vi.fn()
    render(<AccountForm onSubmit={onSubmit} onCancel={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText('Ej. Cuenta nómina'), { target: { value: 'Nueva' } })
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.not.objectContaining({ id: expect.any(String) }))
  })

  it('pre-fills fields when editing', () => {
    render(<AccountForm initial={savingsAccount} onSubmit={vi.fn()} onCancel={() => {}} />)
    expect(screen.getByPlaceholderText('Ej. Cuenta nómina')).toHaveValue('Cuenta remunerada')
  })

  it('cancels editing', () => {
    const onCancel = vi.fn()
    render(<AccountForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
