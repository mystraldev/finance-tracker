import BudgetProgress from './BudgetProgress'
import Icon from './Icon'
import { budgetStatusLabel } from './budgetStatus'
import type { CategoryBudget } from '../types/finance'

type BudgetsCardProps = {
  budgets: CategoryBudget[]
  totalCount?: number
}

function BudgetsCard({ budgets, totalCount = budgets.length }: BudgetsCardProps) {
  return (
    <section className="card budgets">
      <header className="card__header">
        <h3 className="card__title">Presupuestos</h3>
        <span className="card__subtitle">
          {totalCount > budgets.length
            ? `${budgets.length} prioritarias de ${totalCount}`
            : `${totalCount} ${totalCount === 1 ? 'categoría' : 'categorías'}`}
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

              <BudgetProgress budget={b} showBadge={false} showPercent />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BudgetsCard
