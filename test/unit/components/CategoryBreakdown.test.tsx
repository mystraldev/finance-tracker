import type { CategoryBreakdownItem } from '../../../src/types/finance'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import CategoryBreakdown from '../../../src/components/CategoryBreakdown'

const categories: CategoryBreakdownItem[] = [
  { id: 'home', label: 'Vivienda', color: '#0a6ce0', icon: 'home', amount: 850 },
  { id: 'food', label: 'Alimentación', color: '#10b981', icon: 'cart', amount: 410 },
  { id: 'leisure', label: 'Ocio', color: '#ec4899', icon: 'leisure', amount: 250 },
]

describe('CategoryBreakdown', () => {
  it('renders the total and category items', () => {
    render(<CategoryBreakdown categories={categories} />)
    expect(screen.getByText('Gastos por categoría')).toBeInTheDocument()
    expect(screen.getByText('Vivienda')).toBeInTheDocument()
    expect(screen.getByText('Alimentación')).toBeInTheDocument()
    expect(screen.getByText('Ocio')).toBeInTheDocument()
  })

  it('formats the total amount', () => {
    render(<CategoryBreakdown categories={categories} />)
    expect(screen.getByText('gastado')).toBeInTheDocument()
  })

  it('renders the SVG donut chart', () => {
    const { container } = render(<CategoryBreakdown categories={categories} />)
    expect(container.querySelector(':scope svg')).toBeInTheDocument()
    const circles = container.querySelectorAll(':scope svg circle')
    expect(circles.length).toBeGreaterThan(categories.length)
  })

  it('handles empty categories', () => {
    const { container } = render(<CategoryBreakdown categories={[]} />)
    expect(screen.getByText('Gastos por categoría')).toBeInTheDocument()
    expect(container.querySelectorAll('.breakdown__item')).toHaveLength(0)
  })
})
