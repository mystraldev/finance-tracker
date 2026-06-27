import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Icon from '../../../src/components/Icon'

describe('Icon', () => {
  it('renders a known icon with aria-hidden', () => {
    const { container } = render(<Icon name="wallet" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies size and strokeWidth', () => {
    const { container } = render(<Icon name="plus" size={24} strokeWidth={2} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('stroke-width', '2')
  })

  it('falls back to CircleHelp for unknown names', () => {
    const { container } = render(<Icon name="nonexistent" />)
    const path = container.querySelector('svg')
    expect(path).toBeInTheDocument()
  })
})
