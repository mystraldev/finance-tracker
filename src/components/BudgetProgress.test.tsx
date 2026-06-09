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
  paceStatus: 'over',
  expectedPct: 1,
  projectedSpend: 300,
  dailyRemaining: 0,
  previousSpent: 240,
  previousDelta: 60,
}

describe('BudgetProgress', () => {
  it('renders meter, status badge and over-budget copy', () => {
    render(<BudgetProgress budget={budget} />)

    expect(screen.getByRole('meter', { name: /Alimentación/i })).toHaveAttribute('aria-valuenow', '250')
    expect(screen.getAllByText('Superado')).toHaveLength(2)
    expect(screen.getByText(/por encima/)).toBeInTheDocument()
  })

  it('can hide the badge and show the percentage', () => {
    render(<BudgetProgress budget={budget} showBadge={false} showPercent showInsights={false} />)

    expect(screen.queryByText('Superado')).not.toBeInTheDocument()
    expect(screen.getByText(/120,0/)).toBeInTheDocument()
  })
})
