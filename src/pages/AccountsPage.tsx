import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import AccountForm from '../components/AccountForm'
import SavingsGoalForm from '../components/SavingsGoalForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useFinance } from '../store/financeContext'
import { accountsWithBalance, netWorthAsOf } from '../utils/derive'
import { formatCurrency, formatPercent } from '../utils/format'
import type { Account, SavingsGoal } from '../types/finance'

const TYPE_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  savings: 'Remunerada',
  investment: 'Inversión',
}

function AccountsPage() {
  const state = useFinance()
  const {
    transactions,
    transfers,
    recurringRules,
    savingsGoals,
    addAccount,
    updateAccount,
    deleteAccount,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = state

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [blocked, setBlocked] = useState<Account | null>(null)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null)

  const accounts = accountsWithBalance(state)
  const total = netWorthAsOf(state)
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0)
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)

  const usageCount = (id: string) => transactions.filter((t) => t.accountId === id).length
  const transferUsageCount = (id: string) =>
    transfers.filter((transfer) => transfer.fromAccountId === id || transfer.toAccountId === id).length
  const recurringUsageCount = (id: string) =>
    recurringRules.filter((rule) =>
      rule.type === 'transfer'
        ? rule.fromAccountId === id || rule.toAccountId === id
        : rule.accountId === id,
    ).length
  const goalUsageCount = (id: string) => savingsGoals.filter((goal) => goal.accountId === id).length

  function handleDelete(acc: Account) {
    if (
      usageCount(acc.id) > 0 ||
      transferUsageCount(acc.id) > 0 ||
      recurringUsageCount(acc.id) > 0 ||
      goalUsageCount(acc.id) > 0
    ) setBlocked(acc)
    else setDeleting(acc)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Cuentas</h1>
        </div>
        <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nueva cuenta
        </button>
      </header>

      <div className="accounts-total card">
        <span className="accounts-total__label">Patrimonio total</span>
        <span className="accounts-total__value tnum">{formatCurrency(total)}</span>
      </div>

      <section className="savings-goals">
        <div className="section-header">
          <div>
            <h2 className="section-header__title">Objetivos de ahorro</h2>
            <p className="section-header__meta">
              {savingsGoals.length > 0
                ? `${formatCurrency(totalSaved)} reservados de ${formatCurrency(totalTarget)}`
                : 'Reserva dinero para metas concretas sin crear movimientos.'}
            </p>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setCreatingGoal(true)}>
            <Icon name="plus" size={18} strokeWidth={2.2} />
            Nuevo objetivo
          </button>
        </div>

        {savingsGoals.length > 0 ? (
          <div className="goals-grid">
            {savingsGoals.map((goal) => {
              const account = goal.accountId ? accountById.get(goal.accountId) : null
              const pct = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0
              const complete = goal.savedAmount >= goal.targetAmount
              const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)

              return (
                <article key={goal.id} className="goal-card">
                  <div className="goal-card__top">
                    <span
                      className="icon-tile"
                      style={{
                        color: goal.color,
                        background: `color-mix(in srgb, ${goal.color} 14%, transparent)`,
                      }}
                    >
                      <Icon name={goal.icon} size={20} />
                    </span>
                    <div className="cat-card__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Editar objetivo ${goal.name}`}
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        aria-label={`Borrar objetivo ${goal.name}`}
                        onClick={() => setDeletingGoal(goal)}
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="goal-card__body">
                    <div>
                      <h3 className="goal-card__title">{goal.name}</h3>
                      <p className="goal-card__meta">
                        {account?.name ?? 'Sin cuenta vinculada'}
                        {goal.targetDate && ` · antes de ${goal.targetDate}`}
                      </p>
                    </div>
                    <span className={`goal-card__badge ${complete ? 'is-complete' : ''}`}>
                      {complete ? 'Completado' : `${formatCurrency(remaining)} restantes`}
                    </span>
                  </div>

                  <div className="goal-progress">
                    <div
                      className="goal-progress__bar"
                      role="meter"
                      aria-label={`${goal.name}: ${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}`}
                      aria-valuemin={0}
                      aria-valuemax={goal.targetAmount}
                      aria-valuenow={Math.min(goal.savedAmount, goal.targetAmount)}
                    >
                      <span
                        className="goal-progress__fill"
                        style={{
                          width: `${Math.min(pct, 1) * 100}%`,
                          background: complete ? 'var(--grad-emerald)' : goal.color,
                        }}
                      />
                    </div>
                    <div className="goal-progress__meta">
                      <span className="tnum">
                        {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="tnum">{formatPercent(pct)}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="goal-empty">
            <span className="budget-empty__icon">
              <Icon name="piggy" size={18} />
            </span>
            <div className="budget-empty__copy">
              <p>Todavía no hay objetivos.</p>
              <span>Empieza por una meta pequeña y reserva una cantidad inicial.</span>
            </div>
            <button type="button" className="card__action" onClick={() => setCreatingGoal(true)}>
              Crear objetivo
            </button>
          </div>
        )}
      </section>

      <div className="cat-grid">
        {accounts.map((a) => (
          <article key={a.id} className={`account-card account-card--${a.accent}`}>
            <div className="account-card__top">
              <span className={`icon-tile icon-tile--${a.accent}`}>
                <Icon name={a.icon} size={20} />
              </span>
              <div className="cat-card__actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Editar"
                  onClick={() => setEditing(a)}
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  aria-label="Borrar"
                  onClick={() => handleDelete(a)}
                >
                  <Icon name="delete" size={16} />
                </button>
              </div>
            </div>
            <span className="account-card__name">{a.name}</span>
            <span className="account-card__balance tnum">{formatCurrency(a.balance)}</span>
            <span className="account-card__meta">
              {TYPE_LABEL[a.type] ?? a.type}
              {a.type === 'savings' && a.interestRate != null && ` · ${formatPercent(a.interestRate)} TAE`}
              {` · ${usageCount(a.id)} mov.`}
              {transferUsageCount(a.id) > 0 && ` · ${transferUsageCount(a.id)} trasp.`}
              {recurringUsageCount(a.id) > 0 && ` · ${recurringUsageCount(a.id)} rec.`}
              {goalUsageCount(a.id) > 0 && ` · ${goalUsageCount(a.id)} obj.`}
            </span>
          </article>
        ))}
      </div>

      {creating && (
        <Modal title="Nueva cuenta" onClose={() => setCreating(false)}>
          <AccountForm
            onSubmit={(acc) => {
              addAccount(acc as Omit<Account, 'id'>)
              setCreating(false)
            }}
            onCancel={() => setCreating(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Editar cuenta" onClose={() => setEditing(null)}>
          <AccountForm
            initial={editing}
            onSubmit={(acc) => {
              updateAccount(acc as Partial<Account> & { id: string })
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Borrar cuenta"
          message={`¿Seguro que quieres borrar "${deleting.name}"?`}
          onConfirm={() => {
            deleteAccount(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {blocked && (
        <Modal title="No se puede borrar" onClose={() => setBlocked(null)}>
          <p className="confirm__message">
            La cuenta <strong>{blocked.name}</strong> tiene movimientos, traspasos, reglas u objetivos asociados.
            Reasígnalos o bórralos antes de eliminarla.
          </p>
          <div className="form__actions">
            <button type="button" className="btn-primary" onClick={() => setBlocked(null)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}

      {creatingGoal && (
        <Modal title="Nuevo objetivo" onClose={() => setCreatingGoal(false)}>
          <SavingsGoalForm
            accounts={accounts}
            goals={savingsGoals}
            onSubmit={(goal) => {
              addSavingsGoal(goal as Omit<SavingsGoal, 'id'>)
              setCreatingGoal(false)
            }}
            onCancel={() => setCreatingGoal(false)}
          />
        </Modal>
      )}

      {editingGoal && (
        <Modal title="Editar objetivo" onClose={() => setEditingGoal(null)}>
          <SavingsGoalForm
            accounts={accounts}
            goals={savingsGoals}
            initial={editingGoal}
            onSubmit={(goal) => {
              updateSavingsGoal(goal as Partial<SavingsGoal> & { id: string })
              setEditingGoal(null)
            }}
            onCancel={() => setEditingGoal(null)}
          />
        </Modal>
      )}

      {deletingGoal && (
        <ConfirmDialog
          title="Borrar objetivo"
          message={`¿Seguro que quieres borrar "${deletingGoal.name}"?`}
          onConfirm={() => {
            deleteSavingsGoal(deletingGoal.id)
            setDeletingGoal(null)
          }}
          onCancel={() => setDeletingGoal(null)}
        />
      )}
    </>
  )
}

export default AccountsPage
