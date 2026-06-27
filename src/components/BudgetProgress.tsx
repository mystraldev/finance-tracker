import type { CategoryBudget } from '../types/finance'

import { formatBudgetRemaining } from '../utils/budget'
import { formatCurrency, formatPercent } from '../utils/format'
import { budgetStatusLabel } from './budgetStatus'

type BudgetProgressProperties = {
  budget: CategoryBudget
  showBadge?: boolean
  showPercent?: boolean
}

function BudgetProgress({
  budget,
  showBadge = true,
  showPercent = false,
}: BudgetProgressProperties) {
  return (
    <div className="budget-meter">
      <div
        aria-label={`${budget.label}: ${formatCurrency(budget.spent)} de ${formatCurrency(budget.budget)}`}
        aria-valuemax={budget.budget}
        aria-valuemin={0}
        aria-valuenow={Math.min(budget.spent, budget.budget)}
        className="budget-bar"
        role="meter"
      >
        <span
          className={`budget-bar__fill budget-bar__fill--${budget.status}`}
          style={{
            width: `${Math.min(budget.pct, 1) * 100}%`,
            ...((budget.status === 'ok') && { background: budget.color }),
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
