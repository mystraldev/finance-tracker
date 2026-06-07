import { formatBudgetRemaining } from '../utils/budget'
import { formatCurrency, formatPercent } from '../utils/format'
import { budgetStatusLabel } from './budgetStatus'
import type { CategoryBudget } from '../types/finance'

type BudgetProgressProps = {
  budget: CategoryBudget
  showBadge?: boolean
  showPercent?: boolean
}

function BudgetProgress({
  budget,
  showBadge = true,
  showPercent = false,
}: BudgetProgressProps) {
  return (
    <div className="budget-meter">
      <div
        className="budget-bar"
        role="meter"
        aria-label={`${budget.label}: ${formatCurrency(budget.spent)} de ${formatCurrency(budget.budget)}`}
        aria-valuemin={0}
        aria-valuemax={budget.budget}
        aria-valuenow={Math.min(budget.spent, budget.budget)}
      >
        <span
          className={`budget-bar__fill budget-bar__fill--${budget.status}`}
          style={{
            width: `${Math.min(budget.pct, 1) * 100}%`,
            ...(budget.status === 'ok' ? { background: budget.color } : {}),
          }}
        />
      </div>

      <div className="budget-meter__meta">
        <span className="tnum">
          {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
        </span>
        <span className="budget-meter__status">
          {showPercent && <span className="budget-meter__pct tnum">{formatPercent(budget.pct)}</span>}
          {showBadge && (
            <span className={`budget-badge budget-badge--${budget.status}`}>
              {budgetStatusLabel[budget.status]}
            </span>
          )}
        </span>
      </div>

      <div className={`budget-meter__remaining budget-meter__remaining--${budget.status} tnum`}>
        {formatBudgetRemaining(budget.remaining)}
      </div>
    </div>
  )
}

export default BudgetProgress
