import { describe, expect, it } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  // TODO: this assertion assumes es-ES locale output ("1 jun").
  //       If the locale data changes (ICU update, different runtime) the
  //       exact string will break. Either mock the formatter or assert on
  //       a stable substring like "jun".
  it('keeps an ISO calendar date on the same day', () => {
    expect(formatDate('2026-06-01')).toBe('1 jun')
  })
})
