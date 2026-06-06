export const THEME_STORAGE_KEY = 'finance-tracker:theme'
export const THEME_MODES = ['system', 'light', 'dark'] as const

export type Theme = 'light' | 'dark'
export type ThemeMode = (typeof THEME_MODES)[number]

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)
}

export function resolveTheme(mode: ThemeMode, systemTheme: Theme): Theme {
  return mode === 'system' ? systemTheme : mode
}
