import { formatCurrency, formatPercent } from '../utils/format'
import Icon from './Icon'
import { budgetStatusLabel } from './budgetStatus'
import type { CategoryBudget } from '../types/finance'

type BudgetsCardProps = {
  budgets: CategoryBudget[]
}

function BudgetsCard({ budgets }: BudgetsCardProps) {
  return (
    <section className="card budgets">
      <header className="card__header">
        <h3 className="card__title">Presupuestos</h3>
        <span className="card__subtitle">
          {budgets.length} {budgets.length === 1 ? 'categoría' : 'categorías'}
        </span>
      </header>

      <ul className="budget-list">
        {budgets.map((b) => (
          <li key={b.id} className="budget-row">
            <span
              className="budget-row__icon"
              style={{
                color: b.color,
                background: `color-mix(in srgb, ${b.color} 14%, transparent)`,
              }}
            >
              <Icon name={b.icon} size={16} />
            </span>

            <div className="budget-row__main">
              <div className="budget-row__top">
                <span className="budget-row__label">{b.label}</span>
                <span className={`budget-badge budget-badge--${b.status}`}>
                  {budgetStatusLabel[b.status]}
                </span>
              </div>

              <div className="budget-bar">
                <span
                  className={`budget-bar__fill budget-bar__fill--${b.status}`}
                  style={{
                    width: `${Math.min(b.pct, 1) * 100}%`,
                    ...(b.status === 'ok' ? { background: b.color } : {}),
                  }}
                />
              </div>

              <div className="budget-row__meta tnum">
                <span>
                  {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
                </span>
                <span className="budget-row__pct">{formatPercent(b.pct)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BudgetsCard
