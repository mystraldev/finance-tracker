import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SavingsRate from '../../../src/components/SavingsRate'

describe('SavingsRate', () => {
  it('shows the "good" tier and the three stat labels', () => {
    render(<SavingsRate income={3000} expenses={1000} />) // rate ~0.67
    expect(screen.getByText('¡Excelente ritmo!')).toBeInTheDocument()
    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Ahorrado')).toBeInTheDocument()
  })

  it('shows the "mid" tier for a moderate rate', () => {
    render(<SavingsRate income={1000} expenses={850} />) // rate 0.15
    expect(screen.getByText('Vas bien')).toBeInTheDocument()
  })

  it('shows the "low" tier and survives zero income', () => {
    render(<SavingsRate income={0} expenses={0} />) // rate 0
    expect(screen.getByText('Mejorable')).toBeInTheDocument()
  })
})
