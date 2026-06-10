import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import BudgetProgress from './BudgetProgress'
import type { CategoryBudget } from '../types/finance'

const budget: CategoryBudget = {
  id: 'food',
  label: 'Alimentación',
  color: '#10b981',
  icon: 'cart',
  budget: 250,
  spent: 300,
  remaining: -50,
  pct: 1.2,
  status: 'over',
}

describe('BudgetProgress', () => {
  it('renders meter, status badge and over-budget copy', () => {
    render(<BudgetProgress budget={budget} />)

    expect(screen.getByRole('meter', { name: /Alimentación/i })).toHaveAttribute('aria-valuenow', '250')
    expect(screen.getByText('Superado')).toBeInTheDocument()
    expect(screen.getByText(/por encima/)).toBeInTheDocument()
  })

  it('can hide the badge and show the percentage', () => {
    render(<BudgetProgress budget={budget} showBadge={false} showPercent />)

    expect(screen.queryByText('Superado')).not.toBeInTheDocument()
    expect(screen.getByText(/120,0/)).toBeInTheDocument()
  })
})
