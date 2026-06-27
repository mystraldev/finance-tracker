import type { CategoryBudget } from '../../../src/types/finance'
import type { ReactElement } from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import BudgetsCard from '../../../src/components/BudgetsCard'

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
    expect(screen.getByText('Superado')).toBeInTheDocument()
  })

  it('renders an empty state with a categories link', () => {
    renderCard(<BudgetsCard budgets={[]} totalCount={0} />)

    expect(screen.getByText('Sin configurar')).toBeInTheDocument()
    expect(screen.getByText('No hay presupuestos configurados.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Configurar' })).toHaveAttribute('href', '/categorias')
  })
})
