import type { BudgetStatus } from '../types/finance'

// UI label per budget status. In its own module so component files don't mix
// component + constant exports (react-refresh/only-export-components).
export const budgetStatusLabel: Record<BudgetStatus, string> = {
  ok: 'OK',
  warning: 'Al límite',
  over: 'Superado',
}

export const budgetStatusRank: Record<BudgetStatus, number> = {
  over: 0,
  warning: 1,
  ok: 2,
}
