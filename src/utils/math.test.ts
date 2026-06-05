import { describe, expect, it } from 'vitest'
import { fractionOf } from './math'

describe('fractionOf', () => {
  it('calculates a fraction', () => {
    expect(fractionOf(25, 100)).toBe(0.25)
  })

  it('returns zero when the total is zero', () => {
    expect(fractionOf(0, 0)).toBe(0)
  })
})
