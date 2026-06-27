import { describe, expect, it } from 'vitest'

import { parseDecimal } from '../../../src/utils/number'

describe('parseDecimal', () => {
  it('parses plain integers and dot decimals', () => {
    expect(parseDecimal('1234')).toBe(1234)
    expect(parseDecimal('12.5')).toBeCloseTo(12.5)
    expect(parseDecimal('0.99')).toBeCloseTo(0.99)
  })

  it('parses comma decimals', () => {
    expect(parseDecimal('12,5')).toBeCloseTo(12.5)
    expect(parseDecimal('1234,56')).toBeCloseTo(1234.56)
  })

  it('parses Spanish thousands plus comma decimals', () => {
    expect(parseDecimal('1.234,56')).toBeCloseTo(1234.56)
    expect(parseDecimal('1.234.567,89')).toBeCloseTo(1_234_567.89)
  })

  it('treats grouped dots without a comma as thousands separators', () => {
    expect(parseDecimal('1.234')).toBe(1234)
    expect(parseDecimal('12.345')).toBe(12_345)
    expect(parseDecimal('1.234.567')).toBe(1_234_567)
  })

  it('parses English thousands plus dot decimals', () => {
    expect(parseDecimal('1,234.56')).toBeCloseTo(1234.56)
  })

  it('handles negatives and surrounding whitespace', () => {
    expect(parseDecimal(' -12,5 ')).toBeCloseTo(-12.5)
    expect(parseDecimal('-1.234,56')).toBeCloseTo(-1234.56)
  })

  it('rejects invalid input', () => {
    expect(parseDecimal('')).toBeNaN()
    expect(parseDecimal('abc')).toBeNaN()
    expect(parseDecimal('12,5x')).toBeNaN()
    expect(parseDecimal('1,23,4')).toBeNaN()
    expect(parseDecimal('1.23.4')).toBeNaN()
    expect(parseDecimal('.')).toBeNaN()
    expect(parseDecimal('12..5')).toBeNaN()
  })
})
