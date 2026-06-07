import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatGroupDate,
  formatPercent,
  formatSignedCurrency,
} from './format'

// Intl inserts non-breaking spaces before the currency/percent symbol; `\s`
// matches them (U+00A0 / U+202F included) so we normalise to a regular space.
const norm = (s: string) => s.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats euros with es-ES conventions', () => {
    expect(norm(formatCurrency(1234.5))).toBe('1234,50 €')
    expect(norm(formatCurrency(12345.6))).toBe('12.345,60 €')
    expect(norm(formatCurrency(-50))).toBe('-50,00 €')
    expect(norm(formatCurrency(0))).toBe('0,00 €')
  })
})

describe('formatPercent', () => {
  it('formats a fraction as a percentage with one decimal', () => {
    expect(norm(formatPercent(0.2))).toBe('20,0 %')
    expect(norm(formatPercent(0.057))).toBe('5,7 %')
    expect(norm(formatPercent(0))).toBe('0,0 %')
  })
})

describe('formatSignedCurrency', () => {
  it('prefixes an explicit sign', () => {
    expect(norm(formatSignedCurrency(50))).toBe('+50,00 €')
    expect(norm(formatSignedCurrency(-50))).toBe('-50,00 €')
  })
})

describe('formatDate', () => {
  it('keeps an ISO calendar date on the same day', () => {
    expect(formatDate('2026-06-01')).toBe('1 jun')
  })
})

describe('formatGroupDate', () => {
  it('produces a capitalised long date', () => {
    const out = formatGroupDate('2026-06-03')
    expect(out).toMatch(/, 3 de junio$/)
    expect(out[0]).toBe(out[0].toUpperCase())
  })
})
