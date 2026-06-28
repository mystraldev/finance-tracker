import type { AccountWithBalance, SavingsGoal } from '../../../src/types/finance'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SavingsGoalForm from '../../../src/components/SavingsGoalForm'

const accounts: AccountWithBalance[] = [
  {
    id: 'savings',
    name: 'Cuenta remunerada',
    type: 'savings',
    icon: 'piggy',
    accent: 'emerald',
    openingBalance: 12_500,
    balance: 12_500,
  },
]

const goals: SavingsGoal[] = []

describe('SavingsGoalForm', () => {
  it('pre-fills the saved amount from the linked account balance', async () => {
    render(
      <SavingsGoalForm accounts={accounts} goals={goals} onCancel={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '15000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('12500')
    })
  })

  it('caps the pre-filled saved amount at the target amount', async () => {
    render(
      <SavingsGoalForm accounts={accounts} goals={goals} onCancel={() => {}} onSubmit={() => {}} />,
    )

    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '5000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('5000')
    })
  })

  it('submits the selected target date', () => {
    const onSubmit = vi.fn()
    render(
      <SavingsGoalForm accounts={accounts} goals={goals} onCancel={() => {}} onSubmit={onSubmit} />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Viaje' } })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '3000' } })
    fireEvent.change(screen.getByLabelText('Fecha objetivo'), {
      target: { value: '2026-09-01' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear objetivo' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Viaje',
        targetDate: '2026-09-01',
      }),
    )
  })

  it('submits the auto-filled saved amount', async () => {
    const onSubmit = vi.fn()
    render(
      <SavingsGoalForm accounts={accounts} goals={goals} onCancel={() => {}} onSubmit={onSubmit} />,
    )

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Entrada' } })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '15000' } })
    fireEvent.change(screen.getByLabelText('Cuenta asociada'), { target: { value: 'savings' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Reservado')).toHaveValue('12500')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Crear objetivo' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Entrada',
        targetAmount: 15_000,
        savedAmount: 12_500,
        accountId: 'savings',
      }),
    )
  })
})
