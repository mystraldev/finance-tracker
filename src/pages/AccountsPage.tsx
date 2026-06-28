import type { Account, SavingsGoal } from '../types/finance'

import { useState } from 'react'

import AccountForm from '../components/AccountForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import SavingsGoalForm from '../components/SavingsGoalForm'
import { useFinance } from '../store/financeContext'
import { accountsWithBalance, netWorthAsOf } from '../utils/derive'
import { formatCurrency, formatFullDate, formatPercent } from '../utils/format'

const TYPE_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  savings: 'Remunerada',
  investment: 'Inversión',
}

function GoalCard({
  goal,
  accountById,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal
  accountById: Map<string, Account>
  onEdit: () => void
  onDelete: () => void
}) {
  const account = goal.accountId ? accountById.get(goal.accountId) : undefined
  const pct = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0
  const isComplete = goal.savedAmount >= goal.targetAmount
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)
  return (
    <article className="goal-card">
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
          <button aria-label={`Editar objetivo ${goal.name}`} className="icon-btn" onClick={onEdit} type="button">
            <Icon name="edit" size={16} />
          </button>
          <button aria-label={`Borrar objetivo ${goal.name}`} className="icon-btn icon-btn--danger" onClick={onDelete} type="button">
            <Icon name="delete" size={16} />
          </button>
        </div>
      </div>
      <div className="goal-card__body">
        <div>
          <h3 className="goal-card__title">{goal.name}</h3>
          <p className="goal-card__meta">
            {account?.name ?? 'Sin cuenta vinculada'}
            {goal.targetDate && ` · antes del ${formatFullDate(goal.targetDate)}`}
          </p>
        </div>
        <span className={`goal-card__badge ${isComplete ? 'is-complete' : ''}`}>
          {isComplete ? 'Completado' : `${formatCurrency(remaining)} restantes`}
        </span>
      </div>
      <div className="goal-progress">
        <div
          aria-label={`${goal.name}: ${formatCurrency(goal.savedAmount)} de ${formatCurrency(goal.targetAmount)}`}
          aria-valuemax={goal.targetAmount}
          aria-valuemin={0}
          aria-valuenow={Math.min(goal.savedAmount, goal.targetAmount)}
          className="goal-progress__bar"
          role="meter"
        >
          <span
            className="goal-progress__fill"
            style={{
              width: `${Math.min(pct, 1) * 100}%`,
              background: isComplete ? 'var(--grad-emerald)' : goal.color,
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
}

function SavingsGoalsSection({
  goals,
  accountById,
  onEdit,
  onDelete,
  onAdd,
}: {
  goals: SavingsGoal[]
  accountById: Map<string, Account>
  onEdit: (g: SavingsGoal) => void
  onDelete: (g: SavingsGoal) => void
  onAdd: () => void
}) {
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  return (
    <section className="savings-goals">
      <div className="section-header">
        <div>
          <h2 className="section-header__title">Objetivos de ahorro</h2>
          <p className="section-header__meta">
            {goals.length > 0
              ? `${formatCurrency(totalSaved)} reservados de ${formatCurrency(totalTarget)}`
              : 'Reserva dinero para metas concretas sin crear movimientos.'}
          </p>
        </div>
        <button className="btn-ghost" onClick={onAdd} type="button">
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nuevo objetivo
        </button>
      </div>
      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard accountById={accountById} goal={goal} key={goal.id} onDelete={() => onDelete(goal)} onEdit={() => onEdit(goal)} />
          ))}
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
          <button className="card__action" onClick={onAdd} type="button">
            Crear objetivo
          </button>
        </div>
      )}
    </section>
  )
}

function AccountsGrid({
  accounts,
  usageCount,
  goalUsageCount,
  onEdit,
  onDelete,
}: {
  accounts: Account[]
  usageCount: (id: string) => number
  goalUsageCount: (id: string) => number
  onEdit: (a: Account) => void
  onDelete: (a: Account) => void
}) {
  return (
    <div className="cat-grid">
      {accounts.map((a) => (
        <article className={`account-card account-card--${a.accent}`} key={a.id}>
          <div className="account-card__top">
            <span className={`icon-tile icon-tile--${a.accent}`}>
              <Icon name={a.icon} size={20} />
            </span>
            <div className="cat-card__actions">
              <button aria-label="Editar" className="icon-btn" onClick={() => onEdit(a)} type="button">
                <Icon name="edit" size={16} />
              </button>
              <button aria-label="Borrar" className="icon-btn icon-btn--danger" onClick={() => onDelete(a)} type="button">
                <Icon name="delete" size={16} />
              </button>
            </div>
          </div>
          <span className="account-card__name">{a.name}</span>
          <span className="account-card__balance tnum">{formatCurrency(a.balance)}</span>
          <span className="account-card__meta">
            {TYPE_LABEL[a.type] ?? a.type}
            {a.type === 'savings' && a.interestRate !== undefined && ` · ${formatPercent(a.interestRate)} TAE`}
            {` · ${usageCount(a.id)} mov.`}
            {goalUsageCount(a.id) > 0 && ` · ${goalUsageCount(a.id)} obj.`}
          </span>
        </article>
      ))}
    </div>
  )
}

function AccountModals({
  creating,
  editing,
  deleting,
  blocked,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
  onCloseBlocked,
  addAccount,
  updateAccount,
  deleteAccount,
}: {
  creating: boolean
  editing: Account | undefined
  deleting: Account | undefined
  blocked: Account | undefined
  onCloseCreate: () => void
  onCloseEdit: () => void
  onCloseDelete: () => void
  onCloseBlocked: () => void
  addAccount: (a: Omit<Account, 'id'>) => void
  updateAccount: (a: Partial<Account> & { id: string }) => void
  deleteAccount: (id: string) => void
}) {
  return (
    <>
      {creating && (
        <Modal onClose={onCloseCreate} title="Nueva cuenta">
          <AccountForm
            onCancel={onCloseCreate}
            onSubmit={(a) => {
              addAccount(a as Omit<Account, 'id'>)
              onCloseCreate()
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal onClose={onCloseEdit} title="Editar cuenta">
          <AccountForm
            initial={editing}
            onCancel={onCloseEdit}
            onSubmit={(a) => {
              updateAccount(a as Partial<Account> & { id: string })
              onCloseEdit()
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          message={`¿Seguro que quieres borrar "${deleting.name}"?`}
          onCancel={onCloseDelete}
          onConfirm={() => {
            deleteAccount(deleting.id)
            onCloseDelete()
          }}
          title="Borrar cuenta"
        />
      )}
      {blocked && (
        <Modal onClose={onCloseBlocked} title="No se puede borrar">
          <p className="confirm__message">
            La cuenta <strong>{blocked.name}</strong> tiene movimientos u objetivos asociados. Reasígnalos o bórralos antes de eliminarla.
          </p>
          <div className="form__actions">
            <button className="btn-primary" onClick={onCloseBlocked} type="button">
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function GoalModals({
  creating,
  editing,
  deleting,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
  addGoal,
  updateGoal,
  deleteGoal,
  accounts,
  goals,
}: {
  creating: boolean
  editing: SavingsGoal | undefined
  deleting: SavingsGoal | undefined
  onCloseCreate: () => void
  onCloseEdit: () => void
  onCloseDelete: () => void
  addGoal: (g: Omit<SavingsGoal, 'id'>) => void
  updateGoal: (g: Partial<SavingsGoal> & { id: string }) => void
  deleteGoal: (id: string) => void
  accounts: Account[]
  goals: SavingsGoal[]
}) {
  return (
    <>
      {creating && (
        <Modal onClose={onCloseCreate} title="Nuevo objetivo">
          <SavingsGoalForm
            accounts={accounts}
            goals={goals}
            onCancel={onCloseCreate}
            onSubmit={(g) => {
              addGoal(g as Omit<SavingsGoal, 'id'>)
              onCloseCreate()
            }}
          />
        </Modal>
      )}
      {editing && (
        <Modal onClose={onCloseEdit} title="Editar objetivo">
          <SavingsGoalForm
            accounts={accounts}
            goals={goals}
            initial={editing}
            onCancel={onCloseEdit}
            onSubmit={(g) => {
              updateGoal(g as Partial<SavingsGoal> & { id: string })
              onCloseEdit()
            }}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          message={`¿Seguro que quieres borrar "${deleting.name}"?`}
          onCancel={onCloseDelete}
          onConfirm={() => {
            deleteGoal(deleting.id)
            onCloseDelete()
          }}
          title="Borrar objetivo"
        />
      )}
    </>
  )
}

function AccountsPage() {
  const state = useFinance()
  const { transactions, savingsGoals, addAccount, updateAccount, deleteAccount, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } =
    state
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Account | undefined>(undefined)
  const [deleting, setDeleting] = useState<Account | undefined>(undefined)
  const [blocked, setBlocked] = useState<Account | undefined>(undefined)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | undefined>(undefined)
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | undefined>(undefined)
  const accounts = accountsWithBalance(state)
  const total = netWorthAsOf(state)
  const accountById = new Map(accounts.map((a) => [a.id, a]))
  const usageCount = (id: string) => transactions.filter((t) => t.accountId === id).length
  const goalUsageCount = (id: string) => savingsGoals.filter((g) => g.accountId === id).length

  function handleDelete(a: Account) {
    if (usageCount(a.id) > 0 || goalUsageCount(a.id) > 0) setBlocked(a)
    else setDeleting(a)
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Cuentas</h1>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)} type="button">
          <Icon name="plus" size={18} strokeWidth={2.2} />
          Nueva cuenta
        </button>
      </header>
      <div className="accounts-total card">
        <span className="accounts-total__label">Patrimonio total</span>
        <span className="accounts-total__value tnum">{formatCurrency(total)}</span>
      </div>
      <SavingsGoalsSection
        accountById={accountById}
        goals={savingsGoals}
        onAdd={() => setCreatingGoal(true)}
        onDelete={setDeletingGoal}
        onEdit={setEditingGoal}
      />
      <AccountsGrid
        accounts={accounts}
        goalUsageCount={goalUsageCount}
        onDelete={handleDelete}
        onEdit={setEditing}
        usageCount={usageCount}
      />
      <AccountModals
        addAccount={addAccount}
        blocked={blocked}
        creating={creating}
        deleteAccount={deleteAccount}
        deleting={deleting}
        editing={editing}
        onCloseBlocked={() => setBlocked(undefined)}
        onCloseCreate={() => setCreating(false)}
        onCloseDelete={() => setDeleting(undefined)}
        onCloseEdit={() => setEditing(undefined)}
        updateAccount={updateAccount}
      />
      <GoalModals
        accounts={accounts}
        addGoal={addSavingsGoal}
        creating={creatingGoal}
        deleteGoal={deleteSavingsGoal}
        deleting={deletingGoal}
        editing={editingGoal}
        goals={savingsGoals}
        onCloseCreate={() => setCreatingGoal(false)}
        onCloseDelete={() => setDeletingGoal(undefined)}
        onCloseEdit={() => setEditingGoal(undefined)}
        updateGoal={updateSavingsGoal}
      />
    </>
  )
}

export default AccountsPage
