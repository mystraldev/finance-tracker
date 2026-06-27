import type { Theme, ThemeMode } from './theme'

import { createContext, useContext } from 'react'

export type ThemeContextValue = {
  mode: ThemeMode
  theme: Theme
  systemTheme: Theme
  setMode: (_mode: ThemeMode) => void
  cycleMode: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  }
  return context
}
