import { describe, expect, it } from 'vitest'

import { isThemeMode, resolveTheme } from '../../../src/store/theme'

describe('theme', () => {
  it('resolves system mode from the current system theme', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark')
    expect(resolveTheme('system', 'light')).toBe('light')
  })

  it('validates supported theme modes', () => {
    expect(isThemeMode('system')).toBe(true)
    expect(isThemeMode('light')).toBe(true)
    expect(isThemeMode('dark')).toBe(true)
    expect(isThemeMode('sepia')).toBe(false)
  })
})
