import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Sparkline from '../../../src/components/Sparkline'

describe('Sparkline', () => {
  it('renders nothing with fewer than two points', () => {
    const { container } = render(<Sparkline data={[5]} id="a" />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders an svg with a line path for valid data', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} id="b" />)
    expect(container.querySelector('svg.sparkline')).not.toBeNull()
    expect(container.querySelectorAll('path')).toHaveLength(1)
  })

  it('adds a gradient area path when fill is enabled', () => {
    const { container } = render(<Sparkline data={[3, 1, 4]} fill id="c" />)
    expect(container.querySelector('linearGradient#spark-c')).not.toBeNull()
    expect(container.querySelectorAll('path')).toHaveLength(2)
  })
})
