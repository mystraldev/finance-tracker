import { describe, expect, it } from 'vitest'

import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatGroupDate,
  formatPercent,
  formatSignedCurrency,
} from '../../../src/utils/format'

// `Intl` output is locale/ICU-dependent. We normalise the non-breaking spaces it
// inserts (U+00A0 / U+202F) and use tolerant matchers, so the suite checks the
// es-ES contract (decimal comma, symbol, grouping happens) without being brittle
// about ICU spacing, the grouping-separator variant, or month/weekday spelling.
const norm = (s: string) => s.replaceAll(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats euros with es-ES conventions', () => {
    expect(norm(formatCurrency(1234.5))).toMatch(/^1234,50 €$/)
    // The `.` tolerates whatever thousands separator ICU emits.
    expect(norm(formatCurrency(12_345.6))).toMatch(/^12.345,60 €$/)
    expect(norm(formatCurrency(-50))).toMatch(/^-50,00 €$/)
    expect(norm(formatCurrency(0))).toMatch(/^0,00 €$/)
  })
})

describe('formatPercent', () => {
  it('formats a fraction as a percentage with one decimal', () => {
    expect(norm(formatPercent(0.2))).toMatch(/^20,0 %$/)
    expect(norm(formatPercent(0.057))).toMatch(/^5,7 %$/)
    expect(norm(formatPercent(0))).toMatch(/^0,0 %$/)
  })
})

describe('formatSignedCurrency', () => {
  it('prefixes an explicit sign (our logic) and formats the amount', () => {
    expect(formatSignedCurrency(50).startsWith('+')).toBe(true)
    expect(formatSignedCurrency(-50).startsWith('-')).toBe(true)
    expect(norm(formatSignedCurrency(50))).toMatch(/^\+50,00 €$/)
    expect(norm(formatSignedCurrency(-50))).toMatch(/^-50,00 €$/)
  })
})

describe('formatDate', () => {
  it('keeps an ISO calendar date on the same day (no timezone drift)', () => {
    // Tolerant of the month abbreviation spelling ("jun" / "jun.").
    expect(formatDate('2026-06-01')).toMatch(/^1\s+jun/i)
  })
})

describe('formatCompactCurrency', () => {
  it('formats large values with compact notation', () => {
    const out = formatCompactCurrency(1500)
    expect(out).toMatch(/€/)
  })
})

describe('formatFullDate', () => {
  it('includes the year in the formatted date', () => {
    const out = formatFullDate('2026-06-15')
    expect(out).toMatch(/2026/)
  })
})

describe('formatGroupDate', () => {
  it('produces a capitalised long date', () => {
    const out = formatGroupDate('2026-06-03')
    expect(out).toMatch(/3 de junio/i)
    expect(out[0]).toBe(out[0].toUpperCase())
  })
})
