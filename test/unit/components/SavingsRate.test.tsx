import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SavingsRate from '../../../src/components/SavingsRate'

describe('SavingsRate', () => {
  it('shows the "good" tier and the three stat labels', () => {
    render(<SavingsRate expenses={1000} income={3000} />) // rate ~0.67
    expect(screen.getByText('¡Excelente ritmo!')).toBeInTheDocument()
    expect(screen.getByText('Ingresos')).toBeInTheDocument()
    expect(screen.getByText('Gastos')).toBeInTheDocument()
    expect(screen.getByText('Ahorrado')).toBeInTheDocument()
  })

  it('shows the "mid" tier for a moderate rate', () => {
    render(<SavingsRate expenses={850} income={1000} />) // rate 0.15
    expect(screen.getByText('Vas bien')).toBeInTheDocument()
  })

  it('shows the "low" tier and survives zero income', () => {
    render(<SavingsRate expenses={0} income={0} />) // rate 0
    expect(screen.getByText('Mejorable')).toBeInTheDocument()
  })
})
