import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RecentTransactions from './RecentTransactions'
import type { Account, Category, FinanceActivity } from '../types/finance'

const accounts: Account[] = [
  {
    id: 'checking',
    name: 'Cuenta corriente',
    type: 'cash',
    icon: 'wallet',
    accent: 'indigo',
    openingBalance: 0,
  },
]

const categories: Category[] = [
  { id: 'income', label: 'Ingresos', color: '#22c55e', icon: 'salary' },
]

const activities: FinanceActivity[] = [
  {
    kind: 'transaction',
    id: 't1',
    date: '2026-06-01',
    amount: 2000,
    description: 'Nómina',
    accountId: 'checking',
    categoryId: 'income',
  },
]

describe('RecentTransactions', () => {
  it('links to the full transactions page', () => {
    render(
      <MemoryRouter>
        <RecentTransactions activities={activities} accounts={accounts} categories={categories} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/movimientos')
  })

  it('uses the category color on recent transaction icons', () => {
    render(
      <MemoryRouter>
        <RecentTransactions activities={activities} accounts={accounts} categories={categories} />
      </MemoryRouter>,
    )

    const iconTile = screen.getByText('Nómina').closest('.tx')?.querySelector('.tx__icon')

    expect(iconTile).toHaveStyle({
      color: '#22c55e',
      background: 'color-mix(in srgb, #22c55e 13%, transparent)',
    })
  })
})
