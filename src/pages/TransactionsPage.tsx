import { useState } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import TransferForm from '../components/TransferForm'
import ConfirmDialog from '../components/ConfirmDialog'
import AddTransactionButton from '../components/AddTransactionButton'
import { useFinance } from '../store/financeContext'
import {
  categoryMap,
  monthKey,
  monthLabel,
} from '../utils/derive'
import { formatCurrency, formatDate, formatSignedCurrency } from '../utils/format'
import type { FinanceActivity, Transaction, TransactionSort, Transfer } from '../types/finance'

const PAGE_SIZE = 24

function TransactionsPage() {
  const {
    categories,
    accounts,
    getActivities,
    getAvailableMonths,
    updateTransaction,
    deleteTransaction,
    updateTransfer,
    deleteTransfer,
  } =
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null)
  const [deleting, setDeleting] = useState<FinanceActivity | null>(null)

  const allActivities = getActivities({ sort: 'date-desc' })
  const filtered = getActivities({
    month,
    categoryId,
    accountId,
    type:
      type === 'ingreso'
        ? 'income'
        : type === 'gasto'
          ? 'expense'
          : type === 'traspaso'
            ? 'transfer'
            : 'all',
    search,
    sort,
  })

  const transactionActivities = filtered.filter((activity) => activity.kind === 'transaction')
  const income = transactionActivities.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = filtered
    .filter((t) => t.kind === 'transaction' && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const net = income - expenses
  const transferCount = filtered.filter((activity) => activity.kind === 'transfer').length

  const visibleActivities = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleActivities.length
  const groups = (() => {
    const byMonth = new Map<string, FinanceActivity[]>()
    visibleActivities.forEach((activity) => {
      const key = monthKey(activity.date)
      byMonth.set(key, [...(byMonth.get(key) ?? []), activity])
    })

    return [...byMonth.entries()]
      .sort(([a], [b]) => {
        if (a === b) return 0
        return sort === 'date-asc' ? (a < b ? -1 : 1) : (a < b ? 1 : -1)
      })
      .map(([month, items]) => {
        const income = items
          .filter((activity) => activity.kind === 'transaction' && activity.amount > 0)
          .reduce((sum, transaction) => sum + transaction.amount, 0)
        const expenses = items
          .filter((activity) => activity.kind === 'transaction' && activity.amount < 0)
          .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
        return {
          month,
          items,
          income,
          expenses,
          net: income - expenses,
          transferCount: items.filter((activity) => activity.kind === 'transfer').length,
        }
      })
  })()

  const setFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value)
    setVisibleCount(PAGE_SIZE)
  }

  const resetFilters = () => {
    setMonth('all')
    setCategoryId('all')
    setAccountId('all')
    setType('all')
    setSearch('')
    setSort('date-desc')
    setVisibleCount(PAGE_SIZE)
  }
  const hasFilters =
    month !== 'all' ||
    categoryId !== 'all' ||
    accountId !== 'all' ||
    type !== 'all' ||
    search.trim() !== ''
  const hasTransactions = allActivities.length > 0

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
            onChange={(e) => setFilter(setSearch, e.target.value)}
          />
        </label>

        <div className="filters">
          <select
            className="filters__select"
            aria-label="Mes"
            value={month}
            onChange={(e) => setFilter(setMonth, e.target.value)}
          >
            <option value="all">Todos los meses</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
          <select className="filters__select" aria-label="Tipo" value={type} onChange={(e) => setFilter(setType, e.target.value)}>
            <option value="all">Ingresos y gastos</option>
            <option value="gasto">Solo gastos</option>
            <option value="ingreso">Solo ingresos</option>
            <option value="traspaso">Solo traspasos</option>
          </select>
          <select
            className="filters__select"
            aria-label="Categoría"
            value={categoryId}
            onChange={(e) => setFilter(setCategoryId, e.target.value)}
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
            onChange={(e) => setFilter(setAccountId, e.target.value)}
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
            onChange={(e) => setFilter(setSort, e.target.value as TransactionSort)}
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
          <span className="tx-stat__label">Actividades</span>
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
          <span className="tx-stat__label">Traspasos</span>
          <span className="tx-stat__value tnum">{transferCount}</span>
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
            <section key={g.month} className="tx-group">
              <header className="tx-group__header">
                <h3 className="tx-group__date">{monthLabel(g.month)}</h3>
                <dl className="tx-group__summary" aria-label={`Subtotal de ${monthLabel(g.month)}`}>
                  <div>
                    <dt>Ingresos</dt>
                    <dd className="tnum is-in">{formatCurrency(g.income)}</dd>
                  </div>
                  <div>
                    <dt>Gastos</dt>
                    <dd className="tnum">{formatCurrency(g.expenses)}</dd>
                  </div>
                  <div>
                    <dt>Traspasos</dt>
                    <dd className="tnum">{g.transferCount}</dd>
                  </div>
                  <div>
                    <dt>Neto</dt>
                    <dd className={`tnum ${g.net >= 0 ? 'is-in' : ''}`}>
                      {formatSignedCurrency(g.net)}
                    </dd>
                  </div>
                </dl>
              </header>
              <ul className="txrow-list">
                {g.items.map((t) => {
                  const transfer = t.kind === 'transfer'
                  const cat = transfer ? null : cats[t.categoryId]
                  const income = !transfer && t.amount > 0
                  const from = transfer ? accById[t.fromAccountId]?.name ?? 'Cuenta origen' : ''
                  const to = transfer ? accById[t.toAccountId]?.name ?? 'Cuenta destino' : ''
                  return (
                    <li key={t.id} className="txrow">
                      <time className="txrow__date" dateTime={t.date}>
                        {formatDate(t.date)}
                      </time>
                      <span
                        className="txrow__icon"
                        style={{ '--c': transfer ? '#6366f1' : income ? '#10b981' : cat?.color ?? '#94a3b8' } as Record<string, string>}
                      >
                        <Icon name={transfer ? 'transfer' : cat?.icon ?? 'package'} size={18} />
                      </span>
                      <div className="txrow__info">
                        <span className="txrow__desc">{t.description}</span>
                      </div>
                      <span className="pill txrow__category" style={{ '--c': cat?.color ?? '#94a3b8' } as Record<string, string>}>
                        {transfer ? 'Traspaso' : cat?.label ?? 'Sin categoría'}
                      </span>
                      <span className="txrow__account">
                        {transfer ? `${from} → ${to}` : accById[t.accountId]?.name ?? 'Cuenta'}
                      </span>
                      <span className={`txrow__amount tnum ${income ? 'is-in' : ''} ${transfer ? 'is-transfer' : ''}`}>
                        {transfer ? formatCurrency(t.amount) : formatSignedCurrency(t.amount)}
                      </span>
                      <div className="txrow__actions">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label="Editar"
                          onClick={() => {
                            if (transfer) setEditingTransfer(t as Transfer)
                            else setEditingTransaction(t as Transaction)
                          }}
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
          <footer className="tx-load">
            <span className="tx-load__count">
              Mostrando {visibleActivities.length} de {filtered.length} actividades
            </span>
            {hasMore && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Cargar más
              </button>
            )}
          </footer>
        </div>
      )}

      {editingTransaction && (
        <Modal title="Editar movimiento" onClose={() => setEditingTransaction(null)}>
          <TransactionForm
            accounts={accounts}
            categories={categories}
            initial={editingTransaction}
            onSubmit={(tx) => {
              updateTransaction(tx as Partial<Transaction> & { id: string })
              setEditingTransaction(null)
            }}
            onCancel={() => setEditingTransaction(null)}
          />
        </Modal>
      )}

      {editingTransfer && (
        <Modal title="Editar traspaso" onClose={() => setEditingTransfer(null)}>
          <TransferForm
            accounts={accounts}
            initial={editingTransfer}
            onSubmit={(transfer) => {
              updateTransfer(transfer as Partial<Transfer> & { id: string })
              setEditingTransfer(null)
            }}
            onCancel={() => setEditingTransfer(null)}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Borrar movimiento"
          message={`¿Seguro que quieres borrar "${deleting.description}"? Esta acción no se puede deshacer.`}
          onConfirm={() => {
            if (deleting.kind === 'transfer') deleteTransfer(deleting.id)
            else deleteTransaction(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

export default TransactionsPage
