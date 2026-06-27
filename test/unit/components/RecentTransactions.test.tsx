import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RecentTransactions from '../../../src/components/RecentTransactions'
import type { EnrichedTransaction } from '../../../src/types/finance'

const transactions: EnrichedTransaction[] = [
  {
    id: 't1',
    date: '2026-06-01',
    amount: 2000,
    description: 'Nómina',
    accountId: 'checking',
    categoryId: 'income',
    category: 'Ingresos',
    icon: 'salary',
    color: '#22c55e',
  },
]

describe('RecentTransactions', () => {
  it('links to the full transactions page', () => {
    render(
      <MemoryRouter>
        <RecentTransactions transactions={transactions} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/movimientos')
  })

  it('uses the category color on recent transaction icons', () => {
    render(
      <MemoryRouter>
        <RecentTransactions transactions={transactions} />
      </MemoryRouter>,
    )

    const iconTile = screen.getByText('Nómina').closest('.tx')?.querySelector('.tx__icon')

    expect(iconTile).toHaveStyle({
      color: '#22c55e',
      background: 'color-mix(in srgb, #22c55e 13%, transparent)',
    })
  })
})
