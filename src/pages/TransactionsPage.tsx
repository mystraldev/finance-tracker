import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import ConfirmDialog from '../components/ConfirmDialog'
import AddTransactionButton from '../components/AddTransactionButton'
import { useFinance } from '../store/financeContext'
import {
  categoryMap,
  monthLabel,
} from '../utils/derive'
import { formatCurrency, formatSignedCurrency, formatGroupDate } from '../utils/format'
import type { Transaction, TransactionSort } from '../types/finance'

function TransactionsPage() {
  const { categories, accounts, getTransactions, getAvailableMonths, updateTransaction, deleteTransaction } =
    useFinance()

  const cats = categoryMap(categories)
  const accById = Object.fromEntries(accounts.map((a) => [a.id, a]))
  const months = getAvailableMonths()

  const [month, setMonth] = useState('all')
  const [categoryId, setCategoryId] = useState('all')
  const [accountId, setAccountId] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TransactionSort>('date-desc')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const allTransactions = getTransactions({ sort: 'date-desc' })
  const filtered = getTransactions({
    month,
    categoryId,
    accountId,
    type: type === 'ingreso' ? 'income' : type === 'gasto' ? 'expense' : 'all',
    search,
    sort,
  })

  const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = filtered
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const net = income - expenses

  const groups: { date: string; items: Transaction[] }[] = []
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
    setSearch('')
    setSort('date-desc')
  }
  const hasFilters =
    month !== 'all' ||
    categoryId !== 'all' ||
    accountId !== 'all' ||
    type !== 'all' ||
    search.trim() !== ''
  const hasTransactions = allTransactions.length > 0

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Movimientos</h1>
        </div>
        <AddTransactionButton />
      </header>

      <section className="tx-toolbar" aria-label="Filtros de movimientos">
        <label className="tx-search">
          <Icon name="search" size={17} />
          <input
            type="search"
            aria-label="Buscar movimientos"
            placeholder="Buscar movimientos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="filters">
          <div className="filters__group">
            <Icon name="filter" size={16} />
            <select
              className="filters__select"
              aria-label="Mes"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="all">Todos los meses</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <select className="filters__select" aria-label="Tipo" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Ingresos y gastos</option>
            <option value="gasto">Solo gastos</option>
            <option value="ingreso">Solo ingresos</option>
          </select>
          <select
            className="filters__select"
            aria-label="Categoría"
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
            aria-label="Cuenta"
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
          <select
            className="filters__select"
            aria-label="Orden"
            value={sort}
            onChange={(e) => setSort(e.target.value as TransactionSort)}
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguos</option>
            <option value="amount-desc">Importe mayor</option>
            <option value="amount-asc">Importe menor</option>
          </select>
          {hasFilters && (
            <button type="button" className="filters__clear" onClick={resetFilters}>
              Limpiar
            </button>
          )}
        </div>
      </section>

      <div className="tx-summary-grid" aria-label="Resumen filtrado">
        <div className="tx-stat">
          <span className="tx-stat__label">Movimientos</span>
          <span className="tx-stat__value tnum">{filtered.length}</span>
        </div>
        <div className="tx-stat">
          <span className="tx-stat__label">Ingresos</span>
          <span className="tx-stat__value tx-stat__value--in tnum">{formatCurrency(income)}</span>
        </div>
        <div className="tx-stat">
          <span className="tx-stat__label">Gastos</span>
          <span className="tx-stat__value tnum">{formatCurrency(expenses)}</span>
        </div>
        <div className="tx-stat">
          <span className="tx-stat__label">Neto</span>
          <span className={`tx-stat__value tnum ${net >= 0 ? 'tx-stat__value--in' : ''}`}>
            {formatSignedCurrency(net)}
          </span>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card empty">
          <Icon name="transactions" size={28} />
          <p>
            {hasTransactions
              ? 'No hay movimientos con estos filtros.'
              : 'Todavía no hay movimientos.'}
          </p>
          {hasFilters && (
            <button type="button" className="filters__clear" onClick={resetFilters}>
              Limpiar filtros
            </button>
          )}
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
                        style={{ '--c': income ? '#10b981' : cat?.color ?? '#94a3b8' } as Record<string, string>}
                      >
                        <Icon name={cat?.icon ?? 'package'} size={18} />
                      </span>
                      <div className="txrow__info">
                        <span className="txrow__desc">{t.description}</span>
                        <span className="txrow__meta">
                          <span className="pill" style={{ '--c': cat?.color ?? '#94a3b8' } as Record<string, string>}>
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
              updateTransaction(tx as Partial<Transaction> & { id: string })
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
