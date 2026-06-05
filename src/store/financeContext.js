import { createContext, useContext } from 'react'

// Contexto + hook en su propio módulo (sin componentes) para no romper
// el fast-refresh de Vite (regla react-refresh/only-export-components).
export const FinanceContext = createContext(null)

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) {
    throw new Error('useFinance debe usarse dentro de <FinanceProvider>')
  }
  return ctx
}
