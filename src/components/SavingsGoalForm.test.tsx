import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SavingsGoalForm from './SavingsGoalForm'
import type { AccountWithBalance, SavingsGoal } from '../types/finance'

const accounts: AccountWithBalance[] = [
  {
    id: 'savings',
    name: 'Cuenta remunerada',
    type: 'savings',
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 12500,
    balance: 12500,
  },
]

const goals: SavingsGoal[] = []

describe('SavingsGoalForm', () => {
  it('pre-fills the saved amount from the linked account balance', async () => {
    render(
      <SavingsGoalForm
        accounts={accounts}
        goals={goals}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '15000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('12500')
    })
  })

  it('caps the pre-filled saved amount at the target amount', async () => {
    render(
      <SavingsGoalForm
        accounts={accounts}
        goals={goals}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '5000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('5000')
    })
  })

  it('keeps the target date year to four digits', () => {
    render(
      <SavingsGoalForm
        accounts={accounts}
        goals={goals}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    )

    const input = screen.getByLabelText('Fecha objetivo')

    fireEvent.change(input, { target: { value: '2026' } })
    expect(input).toHaveValue('2026')

    fireEvent.change(input, { target: { value: '20266' } })
    expect(input).toHaveValue('2026')
  })

  it('submits the auto-filled saved amount', async () => {
    const onSubmit = vi.fn()
    render(
      <SavingsGoalForm
        accounts={accounts}
        goals={goals}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Entrada' } })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '15000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('12500')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Crear objetivo' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Entrada',
      targetAmount: 15000,
      savedAmount: 12500,
      accountId: 'savings',
    }))
  })
})
