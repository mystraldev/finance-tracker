import type { CategoryBudget } from '../types/finance'

import { Link } from 'react-router-dom'

import BudgetProgress from './BudgetProgress'
import { budgetStatusLabel } from './budgetStatus'
import Icon from './Icon'

type BudgetsCardProperties = {
  budgets: CategoryBudget[]
  totalCount?: number
}

function BudgetsCard({ budgets, totalCount = budgets.length }: BudgetsCardProperties) {
  let subtitle: string
  if (totalCount === 0) {
    subtitle = 'Sin configurar'
  } else if (totalCount > budgets.length) {
    subtitle = `${budgets.length} prioritarias de ${totalCount}`
  } else {
    subtitle = `${totalCount} ${totalCount === 1 ? 'categoría' : 'categorías'}`
  }

  return (
    <section className="card budgets">
      <header className="card__header">
        <h3 className="card__title">Presupuestos</h3>
        <span className="card__subtitle">{subtitle}</span>
      </header>

      {budgets.length === 0 ? (
        <div className="budget-empty">
          <span className="budget-empty__icon">
            <Icon name="categories" size={18} />
          </span>
          <div className="budget-empty__copy">
            <p>No hay presupuestos configurados.</p>
            <span>Añade límites mensuales desde Categorías.</span>
          </div>
          <Link className="card__action" to="/categorias">
            Configurar
          </Link>
        </div>
      ) : (
        <ul className="budget-list">
          {budgets.map((b) => (
            <li className="budget-row" key={b.id}>
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
                  <span className={`budget-badge budget-badge--${b.status}`}>{budgetStatusLabel[b.status]}</span>
                </div>

                <BudgetProgress budget={b} showBadge={false} showPercent />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BudgetsCard
