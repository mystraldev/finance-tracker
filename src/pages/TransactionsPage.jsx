import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import ConfirmDialog from '../components/ConfirmDialog'
import AddTransactionButton from '../components/AddTransactionButton'
import { useFinance } from '../store/financeContext'
import {
  availableMonths,
  categoryMap,
  monthKey,
  monthLabel,
} from '../utils/derive'
import { formatSignedCurrency, formatGroupDate } from '../utils/format'

function TransactionsPage() {
  const { transactions, categories, accounts, updateTransaction, deleteTransaction } =
    useFinance()

  const cats = categoryMap(categories)
  const accById = Object.fromEntries(accounts.map((a) => [a.id, a]))
  const months = availableMonths(transactions)

  const [month, setMonth] = useState('all')
  const [categoryId, setCategoryId] = useState('all')
  const [accountId, setAccountId] = useState('all')
  const [type, setType] = useState('all')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filtered = transactions
    .filter((t) => month === 'all' || monthKey(t.date) === month)
    .filter((t) => categoryId === 'all' || t.categoryId === categoryId)
    .filter((t) => accountId === 'all' || t.accountId === accountId)
    .filter((t) =>
      type === 'all' ? true : type === 'ingreso' ? t.amount > 0 : t.amount < 0,
    )
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const net = filtered.reduce((s, t) => s + t.amount, 0)

  // Agrupar por fecha conservando el orden (más reciente primero).
  const groups = []
  filtered.forEach((t) => {
    const last = groups[groups.length - 1]
    if (last && last.date === t.date) last.items.push(t)
    else groups.push({ date: t.date, items: [t] })
  })

  const resetFilters = () => {
    setMonth('all')
    setCategoryId('all')
    setAccountId('all')
    setType('all')
  }
  const hasFilters =
    month !== 'all' || categoryId !== 'all' || accountId !== 'all' || type !== 'all'

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Movimientos</h1>
        </div>
        <AddTransactionButton />
      </header>

      {/* Filtros */}
      <section className="filters">
        <div className="filters__group">
          <Icon name="filter" size={16} />
          <select className="filters__select" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">Todos los meses</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        <select className="filters__select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Ingresos y gastos</option>
          <option value="gasto">Solo gastos</option>
          <option value="ingreso">Solo ingresos</option>
        </select>
        <select
          className="filters__select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="filters__select"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="all">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="filters__clear" onClick={resetFilters}>
            Limpiar
          </button>
        )}
      </section>

      {/* Resumen del filtro */}
      <div className="tx-summary">
        <span className="tnum">{filtered.length} movimientos</span>
        <span className={`tx-summary__net tnum ${net >= 0 ? 'is-in' : 'is-out'}`}>
          Neto: {formatSignedCurrency(net)}
        </span>
      </div>

      {/* Lista */}
      {groups.length === 0 ? (
        <div className="card empty">
          <Icon name="transactions" size={28} />
          <p>No hay movimientos con estos filtros.</p>
        </div>
      ) : (
        <div className="card tx-groups">
          {groups.map((g) => (
            <section key={g.date} className="tx-group">
              <h3 className="tx-group__date">{formatGroupDate(g.date)}</h3>
              <ul className="txrow-list">
                {g.items.map((t) => {
                  const cat = cats[t.categoryId]
                  const income = t.amount > 0
                  return (
                    <li key={t.id} className="txrow">
                      <span
                        className="txrow__icon"
                        style={{ '--c': income ? '#10b981' : cat?.color ?? '#94a3b8' }}
                      >
                        <Icon name={cat?.icon ?? 'package'} size={18} />
                      </span>
                      <div className="txrow__info">
                        <span className="txrow__desc">{t.description}</span>
                        <span className="txrow__meta">
                          <span className="pill" style={{ '--c': cat?.color ?? '#94a3b8' }}>
                            {cat?.label ?? 'Sin categoría'}
                          </span>
                          <span className="txrow__account">
                            {accById[t.accountId]?.name ?? 'Cuenta'}
                          </span>
                        </span>
                      </div>
                      <span className={`txrow__amount tnum ${income ? 'is-in' : ''}`}>
                        {formatSignedCurrency(t.amount)}
                      </span>
                      <div className="txrow__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Editar"
                          onClick={() => setEditing(t)}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          aria-label="Borrar"
                          onClick={() => setDeleting(t)}
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <Modal title="Editar movimiento" onClose={() => setEditing(null)}>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initial={editing}
            onSubmit={(tx) => {
              updateTransaction(tx)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Borrar movimiento"
          message={`¿Seguro que quieres borrar "${deleting.description}"? Esta acción no se puede deshacer.`}
          onConfirm={() => {
            deleteTransaction(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

export default TransactionsPage
