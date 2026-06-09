import { useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import MonthSelector from '../components/MonthSelector'
import RecurringRuleForm from '../components/RecurringRuleForm'
import { useFinance } from '../store/financeContext'
import { monthLabel } from '../utils/derive'
import { formatCurrency, formatDate } from '../utils/format'
import type { RecurringRule, RecurringRuleDraft } from '../types/finance'

const STATUS_LABEL = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  skipped: 'Omitido',
} as const

function RecurringPage() {
  const state = useFinance()
  const {
    accounts,
    categories,
    recurringRules,
    selectedMonth,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    confirmRecurringOccurrence,
    skipRecurringOccurrence,
  } = state
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<RecurringRule | null>(null)
  const [deleting, setDeleting] = useState<RecurringRule | null>(null)

  const occurrences = state.getRecurringOccurrences(selectedMonth)
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Recurrentes</h1>
          <p className="page-header__description">Pendientes de {monthLabel(selectedMonth)}</p>
        </div>
        <div className="page-header__actions">
          <MonthSelector />
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={18} strokeWidth={2.2} />
            Nueva regla
          </button>
        </div>
      </header>

      <section className="card recurring-panel">
        <header className="card__header">
          <h2 className="card__title">Ocurrencias del mes</h2>
          <span className="card__subtitle">{occurrences.length} reglas aplicables</span>
        </header>

        {occurrences.length === 0 ? (
          <div className="empty">
            <Icon name="recurring" size={28} />
            <p>No hay reglas recurrentes para este mes.</p>
          </div>
        ) : (
          <ul className="recurring-list">
            {occurrences.map((item) => (
              <li key={item.id} className={`recurring-row recurring-row--${item.status}`}>
                <span className="recurring-row__icon">
                  <Icon name={item.rule.type === 'transfer' ? 'transfer' : 'recurring'} size={18} />
                </span>
                <div className="recurring-row__copy">
                  <strong>{item.rule.description}</strong>
                  <span>
                    {formatDate(item.date)} · {formatCurrency(item.rule.amount)}
                  </span>
                </div>
                <span className={`recurring-status recurring-status--${item.status}`}>
                  {STATUS_LABEL[item.status]}
                </span>
                {item.status === 'pending' && (
                  <div className="recurring-row__actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => skipRecurringOccurrence(item.rule.id, item.month)}
                    >
                      Omitir
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => confirmRecurringOccurrence(item.rule.id, item.month)}
                    >
                      Confirmar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="recurring-rules">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">Reglas</h2>
            <p className="section-header__meta">{recurringRules.length} reglas configuradas</p>
          </div>
        </div>

        <div className="cat-grid">
          {recurringRules.map((rule) => {
            const meta = rule.type === 'transfer'
              ? `${accountById.get(rule.fromAccountId)?.name ?? 'Cuenta'} → ${accountById.get(rule.toAccountId)?.name ?? 'Cuenta'}`
              : `${accountById.get(rule.accountId)?.name ?? 'Cuenta'} · ${categoryById.get(rule.categoryId)?.label ?? 'Categoría'}`
            return (
              <article key={rule.id} className="recurring-card">
                <span className="icon-tile icon-tile--indigo">
                  <Icon name={rule.type === 'transfer' ? 'transfer' : 'recurring'} size={20} />
                </span>
                <div className="cat-card__info">
                  <span className="cat-card__name">{rule.description}</span>
                  <span className="cat-card__meta">
                    <span>{rule.active ? 'Activa' : 'Pausada'}</span>
                    <span>Día {rule.dayOfMonth}</span>
                    <span className="tnum">{formatCurrency(rule.amount)}</span>
                  </span>
                  <span className="recurring-card__meta">{meta}</span>
                </div>
                <div className="cat-card__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Editar ${rule.description}`}
                    onClick={() => setEditing(rule)}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    aria-label={`Borrar ${rule.description}`}
                    onClick={() => setDeleting(rule)}
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {creating && (
        <Modal title="Nueva regla recurrente" onClose={() => setCreating(false)}>
          <RecurringRuleForm
            accounts={accounts}
            categories={categories}
            onSubmit={(rule) => {
              addRecurringRule(rule as RecurringRuleDraft)
              setCreating(false)
            }}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar regla recurrente" onClose={() => setEditing(null)}>
          <RecurringRuleForm
            accounts={accounts}
            categories={categories}
            initial={editing}
            onSubmit={(rule) => {
              updateRecurringRule(rule as Partial<RecurringRule> & { id: string })
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Borrar regla recurrente"
          message={`¿Seguro que quieres borrar "${deleting.description}"? Los movimientos ya confirmados no se borrarán.`}
          onConfirm={() => {
            deleteRecurringRule(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

export default RecurringPage
