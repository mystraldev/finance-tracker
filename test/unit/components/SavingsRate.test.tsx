import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import SavingsRate from '../../../src/components/SavingsRate'

describe('SavingsRate', () => {
  it('shows the "good" tier and the stat labels when configured', () => {
    // salary 3000, saved 2000 => rate ~0.67
    render(<SavingsRate configured netExpenses={1000} salary={3000} saved={2000} />)
    expect(screen.getByText('¡Excelente ritmo!')).toBeInTheDocument()
    expect(screen.getByText('Nómina')).toBeInTheDocument()
    expect(screen.getByText('Gastos netos')).toBeInTheDocument()
    expect(screen.getByText('Ahorrado')).toBeInTheDocument()
  })

  it('shows the "mid" tier for a moderate rate', () => {
    render(<SavingsRate configured netExpenses={850} salary={1000} saved={150} />) // rate 0.15
    expect(screen.getByText('Vas bien')).toBeInTheDocument()
  })

  it('shows the "low" tier and survives zero salary', () => {
    render(<SavingsRate configured netExpenses={0} salary={0} saved={0} />)
    expect(screen.getByText('Mejorable')).toBeInTheDocument()
  })

  it('shows a setup prompt when no income category is configured', () => {
    render(
      <MemoryRouter>
        <SavingsRate configured={false} netExpenses={0} salary={0} saved={0} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Elegir categoría de ingresos/)).toBeInTheDocument()
    expect(screen.queryByText('Nómina')).not.toBeInTheDocument()
  })
})
