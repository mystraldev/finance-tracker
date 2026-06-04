import { describe, expect, it } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  it('keeps an ISO calendar date on the same day', () => {
    expect(formatDate('2026-06-01')).toBe('1 jun')
  })
})
