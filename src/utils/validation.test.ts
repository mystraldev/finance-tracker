import { describe, expect, it } from 'vitest'
import {
  dateForMonthDay,
  isISODate,
  isMonthKey,
  parseDecimalAmount,
  parseSignedDecimalAmount,
} from './validation'

describe('validation helpers', () => {
  it('parses strict decimal amounts', () => {
    expect(parseDecimalAmount('12,34')).toBe(12.34)
    expect(parseDecimalAmount('12.3')).toBe(12.3)
    expect(parseDecimalAmount('12abc')).toBeNull()
    expect(parseDecimalAmount('-12')).toBeNull()
    expect(parseSignedDecimalAmount('-12,50')).toBe(-12.5)
  })

  it('validates calendar dates and months', () => {
    expect(isISODate('2026-02-28')).toBe(true)
    expect(isISODate('2026-02-31')).toBe(false)
    expect(isMonthKey('2026-06')).toBe(true)
    expect(isMonthKey('2026-13')).toBe(false)
  })

  it('clamps recurring days to the end of short months', () => {
    expect(dateForMonthDay('2026-02', 31)).toBe('2026-02-28')
    expect(dateForMonthDay('2026-04', 31)).toBe('2026-04-30')
  })
})
