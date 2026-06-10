import { Link } from 'react-router-dom'
import Icon from './Icon'
import { formatCurrency, formatDate } from '../utils/format'
import type { CategoryBudget, RecurringOccurrence } from '../types/finance'

type ActionCenterProps = {
  recurring: RecurringOccurrence[]
  budgets: CategoryBudget[]
  onConfirmRecurring: (ruleId: string, month: string) => void
  onSkipRecurring: (ruleId: string, month: string) => void
}

function ActionCenter({
  recurring,
  budgets,
  onConfirmRecurring,
  onSkipRecurring,
}: ActionCenterProps) {
  const pendingRecurring = recurring
    .filter((item) => item.status === 'pending')
    .slice(0, 3)
  const criticalBudgets = budgets
    .filter((budget) => budget.status !== 'ok' || budget.paceStatus !== 'on-track')
    .slice(0, 3)

  if (pendingRecurring.length === 0 && criticalBudgets.length === 0) {
    return null
  }

  return (
    <section className="card action-center">
      <header className="card__header">
        <h3 className="card__title">Acciones del mes</h3>
        <Link to="/recurrentes" className="card__action">
          Recurrentes
        </Link>
      </header>

      <div className="action-center__grid">
        {pendingRecurring.length > 0 && (
          <div className="action-panel">
            <h4 className="action-panel__title">Pendientes recurrentes</h4>
            <ul className="action-list">
              {pendingRecurring.map((item) => (
                <li key={item.id} className="action-item">
                  <span className="action-item__icon">
                    <Icon name={item.rule.type === 'transfer' ? 'transfer' : 'recurring'} size={17} />
                  </span>
                  <div className="action-item__copy">
                    <strong>{item.rule.description}</strong>
                    <span>
                      {formatDate(item.date)} · {formatCurrency(item.rule.amount)}
                    </span>
                  </div>
                  <div className="action-item__actions">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Confirmar ${item.rule.description}`}
                      onClick={() => onConfirmRecurring(item.rule.id, item.month)}
                    >
                      <Icon name="check" size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Omitir ${item.rule.description}`}
                      onClick={() => onSkipRecurring(item.rule.id, item.month)}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {criticalBudgets.length > 0 && (
          <div className="action-panel">
            <h4 className="action-panel__title">Presupuestos a revisar</h4>
            <ul className="action-list">
              {criticalBudgets.map((budget) => (
                <li key={budget.id} className="action-item">
                  <span
                    className="action-item__icon"
                    style={{ '--c': budget.color } as Record<string, string>}
                  >
                    <Icon name={budget.icon} size={17} />
                  </span>
                  <div className="action-item__copy">
                    <strong>{budget.label}</strong>
                    <span>
                      Proyección {formatCurrency(budget.projectedSpend)} · queda{' '}
                      {formatCurrency(Math.max(budget.remaining, 0))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default ActionCenter
