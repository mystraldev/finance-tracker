import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TransferForm from './TransferForm'
import type { Account } from '../types/finance'

const accounts: Account[] = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash',
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 0,
  },
  {
    id: 'savings',
    name: 'Ahorro',
    type: 'savings',
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 0,
  },
]

describe('TransferForm', () => {
  it('submits a valid transfer payload', () => {
    const onSubmit = vi.fn()
    render(<TransferForm accounts={accounts} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '150,50' } })
    fireEvent.change(screen.getByPlaceholderText('Ej. Aportación a ahorro'), {
      target: { value: 'Ahorro mensual' },
    })
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-06-09' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir traspaso' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      amount: 150.5,
      description: 'Ahorro mensual',
      fromAccountId: 'checking',
      toAccountId: 'savings',
      date: '2026-06-09',
    }))
  })

  it('rejects transfers between the same account', () => {
    const onSubmit = vi.fn()
    render(<TransferForm accounts={accounts} onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '50' } })
    fireEvent.change(screen.getByPlaceholderText('Ej. Aportación a ahorro'), {
      target: { value: 'Ahorro mensual' },
    })
    fireEvent.change(screen.getByLabelText('Hacia'), { target: { value: 'checking' } })
    fireEvent.click(screen.getByRole('button', { name: 'Añadir traspaso' }))

    expect(screen.getByText('El origen y el destino deben ser cuentas distintas.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
