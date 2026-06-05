import { createContext, useContext } from 'react'
import type { FinanceContextValue } from '../types/finance'

export const FinanceContext = createContext<FinanceContextValue | null>(null)

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext)
  if (!ctx) {
    throw new Error('useFinance debe usarse dentro de <FinanceProvider>')
  }
  return ctx
}
