import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AccountForm from './AccountForm'
import type { Account } from '../types/finance'

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
})
