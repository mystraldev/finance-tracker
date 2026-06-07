import type { BudgetStatus } from '../types/finance'

// UI label per budget status. In its own module so component files don't mix
// component + constant exports (react-refresh/only-export-components).
export const budgetStatusLabel: Record<BudgetStatus, string> = {
  ok: 'En presupuesto',
  warning: 'Casi al límite',
  over: 'Te has pasado',
}
