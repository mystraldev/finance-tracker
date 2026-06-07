import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Sparkline from './Sparkline'

describe('Sparkline', () => {
  it('renders nothing with fewer than two points', () => {
    const { container } = render(<Sparkline id="a" data={[5]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders an svg with a line path for valid data', () => {
    const { container } = render(<Sparkline id="b" data={[1, 2, 3]} />)
    expect(container.querySelector('svg.sparkline')).not.toBeNull()
    expect(container.querySelectorAll('path').length).toBe(1)
  })

  it('adds a gradient area path when fill is enabled', () => {
    const { container } = render(<Sparkline id="c" data={[3, 1, 4]} fill />)
    expect(container.querySelector('linearGradient#spark-c')).not.toBeNull()
    expect(container.querySelectorAll('path').length).toBe(2)
  })
})
