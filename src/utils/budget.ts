import { formatCurrency } from './format'

export function formatBudgetRemaining(remaining: number): string {
  return remaining < 0
    ? `${formatCurrency(Math.abs(remaining))} por encima`
    : `${formatCurrency(remaining)} restantes`
}
