import type { Theme, ThemeMode } from './theme'
import type { ReactNode } from 'react'

import { useEffect, useMemo, useState } from 'react'

import { isThemeMode, resolveTheme, THEME_MODES, THEME_STORAGE_KEY } from './theme'
import { ThemeContext } from './themeContext'

function getSystemTheme(): Theme {
  if (typeof matchMedia !== 'function') return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

type ThemeProviderProperties = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProperties) {
  const [mode, setMode] = useState<ThemeMode>(loadThemeMode)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)
  const theme = resolveTheme(mode, systemTheme)

  useEffect(() => {
    if (typeof matchMedia !== 'function') return

    const query = matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.themeMode = mode
  }, [mode, theme])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      /* storage not available */
    }
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      theme,
      systemTheme,
      setMode,
      cycleMode: () => {
        setMode((current) => {
          const index = THEME_MODES.indexOf(current)
          return THEME_MODES[(index + 1) % THEME_MODES.length]
        })
      },
    }),
    [mode, systemTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
