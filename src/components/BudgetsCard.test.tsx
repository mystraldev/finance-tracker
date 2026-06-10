import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import BudgetsCard from './BudgetsCard'
import type { CategoryBudget } from '../types/finance'

const budgets: CategoryBudget[] = [
  {
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
  },
]

function renderCard(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('BudgetsCard', () => {
  it('renders prioritised budget count and rows', () => {
    renderCard(<BudgetsCard budgets={budgets} totalCount={3} />)

    expect(screen.getByText('Presupuestos')).toBeInTheDocument()
    expect(screen.getByText('1 prioritarias de 3')).toBeInTheDocument()
    expect(screen.getByText('Alimentación')).toBeInTheDocument()
    expect(screen.getAllByText('Superado')).toHaveLength(2)
  })

  it('renders an empty state with a categories link', () => {
    renderCard(<BudgetsCard budgets={[]} totalCount={0} />)

    expect(screen.getByText('Sin configurar')).toBeInTheDocument()
    expect(screen.getByText('No hay presupuestos configurados.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configurar' })).toHaveAttribute('href', '/categorias')
  })
})
