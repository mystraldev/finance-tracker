import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import RecentTransactions from './RecentTransactions'
import type { EnrichedTransaction } from '../types/finance'

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
})
