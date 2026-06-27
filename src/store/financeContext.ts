import type { FinanceContextValue } from '../types/finance'

import { createContext, useContext } from 'react'

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance debe usarse dentro de <FinanceProvider>')
  }
  return context
}
