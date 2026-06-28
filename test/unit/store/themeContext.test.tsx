import type { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ThemeContext, useTheme } from '../../../src/store/themeContext'

const value = {
  mode: 'system' as const,
  theme: 'light' as const,
  cycleMode: vi.fn(),
}

const wrapper = ({ children }: { children: ReactNode }) => <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>

describe('useTheme', () => {
  it('returns the context value when used inside a provider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.mode).toBe('system')
  })

  it('throws when used outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow()
  })
})
