import { act, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { THEME_STORAGE_KEY } from '../../../src/store/theme'
import { useTheme } from '../../../src/store/themeContext'
import { ThemeProvider } from '../../../src/store/ThemeProvider'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.dataset.theme = ''
  document.documentElement.dataset.themeMode = ''
})

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider>
        <p>hello</p>
      </ThemeProvider>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('initialises from localStorage when available', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(result.current.mode).toBe('dark')
    expect(result.current.theme).toBe('dark')
  })

  it('defaults to system mode when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(result.current.mode).toBe('system')
  })

  it('cycles through modes in order', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(result.current.mode).toBe('system')
    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('light')
    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('dark')
    act(() => result.current.cycleMode())
    expect(result.current.mode).toBe('system')
  })

  it('persists mode to localStorage on change', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    act(() => result.current.cycleMode())
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('sets data attributes on the document element', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider })
    expect(document.documentElement.dataset.theme).toBe('light')
    act(() => result.current.cycleMode())
    expect(document.documentElement.dataset.themeMode).toBe('light')
  })
})
