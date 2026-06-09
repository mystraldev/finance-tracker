import { formatBudgetRemaining } from '../utils/budget'
import { formatCurrency, formatPercent, formatSignedCurrency } from '../utils/format'
import { budgetStatusLabel } from './budgetStatus'
import type { CategoryBudget } from '../types/finance'

type BudgetProgressProps = {
  budget: CategoryBudget
  showBadge?: boolean
  showPercent?: boolean
  showInsights?: boolean
}

function BudgetProgress({
  budget,
  showBadge = true,
  showPercent = false,
  showInsights = true,
}: BudgetProgressProps) {
  const paceLabel =
    budget.paceStatus === 'over'
      ? 'Superado'
      : budget.paceStatus === 'at-risk'
        ? 'En riesgo'
        : 'Buen ritmo'

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

      {showInsights && (
        <div className="budget-meter__insights">
          <span>{paceLabel}</span>
          <span className="tnum">Proy. {formatCurrency(budget.projectedSpend)}</span>
          <span className="tnum">{formatCurrency(budget.dailyRemaining)}/día</span>
          {budget.previousSpent > 0 && (
            <span className="tnum">vs mes ant. {formatSignedCurrency(budget.previousDelta)}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default BudgetProgress
