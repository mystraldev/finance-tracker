import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import AccountForm from '../components/AccountForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useFinance } from '../store/financeContext'
import { accountsWithBalance, netWorthAsOf } from '../utils/derive'
import { formatCurrency, formatPercent } from '../utils/format'

const TYPE_LABEL = {
  cash: 'Efectivo',
  savings: 'Remunerada',
  investment: 'Inversión',
}

function AccountsPage() {
  const state = useFinance()
  const { transactions, addAccount, updateAccount, deleteAccount } = state

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [blocked, setBlocked] = useState(null)

  const accounts = accountsWithBalance(state) // saldo actual (histórico completo)
  const total = netWorthAsOf(state)

  const usageCount = (id) => transactions.filter((t) => t.accountId === id).length

  function handleDelete(acc) {
    if (usageCount(acc.id) > 0) setBlocked(acc)
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
              {a.interestRate != null && ` · ${formatPercent(a.interestRate)} TAE`}
              {` · ${usageCount(a.id)} mov.`}
            </span>
          </article>
        ))}
      </div>

      {creating && (
        <Modal title="Nueva cuenta" onClose={() => setCreating(false)}>
          <AccountForm
            onSubmit={(acc) => {
              addAccount(acc)
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
              updateAccount(acc)
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
            La cuenta <strong>{blocked.name}</strong> tiene movimientos asociados.
            Reasigna o borra esos movimientos antes de eliminarla.
          </p>
          <div className="form__actions">
            <button type="button" className="btn-primary" onClick={() => setBlocked(null)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default AccountsPage
