import type { Account, Category, Transaction, TransactionSort } from '../types/finance'

import { useState } from 'react'

import AddTransactionButton from '../components/AddTransactionButton'
import ConfirmDialog from '../components/ConfirmDialog'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import { useFinance } from '../store/financeContext'
import {
  categoryMap,
  monthKey,
  monthLabel,
} from '../utils/derive'
import { formatCurrency, formatDate, formatSignedCurrency } from '../utils/format'

const PAGE_SIZE = 24

type Group = {
  month: string
  items: Transaction[]
  income: number
  expenses: number
  net: number
}

type TransactionGroupsProperties = {
  groups: Group[]
  cats: Record<string, Category>
  accumulatorById: Record<string, Account>
  hasTransactions: boolean
  hasFilters: boolean
  resetFilters: () => void
  visibleCount: number
  filteredCount: number
  onEdit: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
  onLoadMore: () => void
}

function groupTransactions(transactions: Transaction[], sort: TransactionSort): Group[] {
  const byMonth = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = monthKey(tx.date)
    byMonth.set(key, [...(byMonth.get(key) ?? []), tx])
  }
  return [...byMonth]
    .toSorted(([a], [b]) => {
      if (a === b) return 0
      if (sort === 'date-asc') return a < b ? -1 : 1
      return a < b ? 1 : -1
    })
    .map(([month, items]) => {
      const income = items
        .filter((tx) => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0)
      const expenses = items
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
      return { month, items, income, expenses, net: income - expenses }
    })
}

function useTransactionFilters() {
  const [month, setMonth] = useState('all')
  const [categoryId, setCategoryId] = useState('all')
  const [accountId, setAccountId] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TransactionSort>('date-desc')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

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
    sort !== 'date-desc' ||
    search.trim() !== ''

  let filterType: 'all' | 'income' | 'expense' = 'all'
  if (type === 'ingreso') filterType = 'income'
  else if (type === 'gasto') filterType = 'expense'

  return {
    month, setMonth, categoryId, setCategoryId,
    accountId, setAccountId, type, setType,
    search, setSearch, sort, setSort,
    filterType, visibleCount, setVisibleCount,
    setFilter, resetFilters, hasFilters,
  }
}

function TransactionFilters({
  months, categories, accounts,
  search, month, type, categoryId, accountId, sort,
  hasFilters, setFilter,
  setMonth, setType, setCategoryId, setAccountId, setSearch, setSort,
  resetFilters,
}: {
  months: string[]
  categories: Category[]
  accounts: Account[]
  search: string
  month: string
  type: string
  categoryId: string
  accountId: string
  sort: TransactionSort
  hasFilters: boolean
  setFilter: <T,>(setter: (value: T) => void, value: T) => void
  setMonth: (value: string) => void
  setType: (value: string) => void
  setCategoryId: (value: string) => void
  setAccountId: (value: string) => void
  setSearch: (value: string) => void
  setSort: (value: TransactionSort) => void
  resetFilters: () => void
}) {
  return (
    <section aria-label="Filtros de movimientos" className="tx-toolbar">
      <label className="tx-search">
        <Icon name="search" size={17} />
        <input
          aria-label="Buscar movimientos"
          onChange={(event_) => setFilter(setSearch, event_.target.value)}
          placeholder="Buscar movimientos"
          type="search"
          value={search}
        />
      </label>

      <div className="filters">
        <select
          aria-label="Mes"
          className="filters__select"
          onChange={(event_) => setFilter(setMonth, event_.target.value)}
          value={month}
        >
          <option value="all">Todos los meses</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <select aria-label="Tipo" className="filters__select" onChange={(event_) => setFilter(setType, event_.target.value)} value={type}>
          <option value="all">Ingresos y gastos</option>
          <option value="gasto">Solo gastos</option>
          <option value="ingreso">Solo ingresos</option>
        </select>
        <select
          aria-label="Categoría"
          className="filters__select"
          onChange={(event_) => setFilter(setCategoryId, event_.target.value)}
          value={categoryId}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Cuenta"
          className="filters__select"
          onChange={(event_) => setFilter(setAccountId, event_.target.value)}
          value={accountId}
        >
          <option value="all">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Orden"
          className="filters__select"
          onChange={(event_) => setFilter(setSort, event_.target.value as TransactionSort)}
          value={sort}
        >
          <option value="date-desc">Más recientes</option>
          <option value="date-asc">Más antiguos</option>
          <option value="amount-desc">Importe mayor</option>
          <option value="amount-asc">Importe menor</option>
        </select>
        {hasFilters && (
          <button className="filters__clear" onClick={resetFilters} type="button">
            Limpiar
          </button>
        )}
      </div>
    </section>
  )
}

function TransactionSummary({
  count, income, expenses, net,
}: {
  count: number
  income: number
  expenses: number
  net: number
}) {
  return (
    <div aria-label="Resumen filtrado" className="tx-summary-grid">
      <div className="tx-stat">
        <span className="tx-stat__label">Movimientos</span>
        <span className="tx-stat__value tnum">{count}</span>
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
  )
}

function TransactionGroups(properties: TransactionGroupsProperties) {
  const {
    groups, cats, accumulatorById, hasTransactions, hasFilters, resetFilters,
    visibleCount, filteredCount, onEdit, onDelete, onLoadMore,
  } = properties
  if (groups.length === 0) return (
    <div className="card empty">
      <Icon name="transactions" size={28} />
      <p>{hasTransactions ? 'No hay movimientos con estos filtros.' : 'Todavía no hay movimientos.'}</p>
      {hasFilters && <button className="filters__clear" onClick={resetFilters} type="button">Limpiar filtros</button>}
    </div>
  )

  return (
    <div className="card tx-groups">
      {groups.map((g) => (
        <section className="tx-group" key={g.month}>
          <header className="tx-group__header">
              <h3 className="tx-group__date">{monthLabel(g.month)}</h3>
              <dl aria-label={`Subtotal de ${monthLabel(g.month)}`} className="tx-group__summary">
                <div>
                  <dt>Ingresos</dt>
                  <dd className="tnum is-in">{formatCurrency(g.income)}</dd>
                </div>
                <div>
                  <dt>Gastos</dt>
                  <dd className="tnum">{formatCurrency(g.expenses)}</dd>
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
                const cat = cats[t.categoryId]
                const isIncome = t.amount > 0
                return (
                  <li className="txrow" key={t.id}>
                    <time className="txrow__date" dateTime={t.date}>
                      {formatDate(t.date)}
                    </time>
                    <span
                      className="txrow__icon"
                      style={{ '--c': isIncome ? '#10b981' : cat?.color ?? '#94a3b8' } as Record<string, string>}
                    >
                      <Icon name={cat?.icon ?? 'package'} size={18} />
                    </span>
                    <div className="txrow__info">
                      <span className="txrow__desc">{t.description}</span>
                    </div>
                    <span className="pill txrow__category" style={{ '--c': cat?.color ?? '#94a3b8' } as Record<string, string>}>
                      {cat?.label ?? 'Sin categoría'}
                    </span>
                    <span className="txrow__account">
                      {accumulatorById[t.accountId]?.name ?? 'Cuenta'}
                    </span>
                    <span className={`txrow__amount tnum ${isIncome ? 'is-in' : ''}`}>
                      {formatSignedCurrency(t.amount)}
                    </span>
                    <div className="txrow__actions">
                      <button
                        aria-label="Editar"
                        className="icon-btn"
                        onClick={() => onEdit(t)}
                        type="button"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        aria-label="Borrar"
                        className="icon-btn icon-btn--danger"
                        onClick={() => onDelete(t)}
                        type="button"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      )}
      <footer className="tx-load">
        <span className="tx-load__count">
          Mostrando {visibleCount} de {filteredCount} movimientos
        </span>
        {visibleCount < filteredCount && (
          <button
            className="btn-ghost"
            onClick={onLoadMore}
            type="button"
          >
            Cargar más
          </button>
        )}
      </footer>
    </div>
  )
}

function EditTransactionModal({
  transaction, accounts, categories,
  onClose, onSave,
}: {
  transaction: Transaction
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSave: (tx: Partial<Transaction> & { id: string }) => void
}) {
  return (
    <Modal onClose={onClose} title="Editar movimiento">
      <TransactionForm
        accounts={accounts}
        categories={categories}
        initial={transaction}
        onCancel={onClose}
        onSubmit={(tx) => {
          onSave(tx as Partial<Transaction> & { id: string })
          onClose()
        }}
      />
    </Modal>
  )
}

function DeleteTransactionModal({
  transaction, onClose, onConfirm,
}: {
  transaction: Transaction
  onClose: () => void
  onConfirm: (id: string) => void
}) {
  return (
    <ConfirmDialog
      message={`¿Seguro que quieres borrar "${transaction.description}"? Esta acción no se puede deshacer.`}
      onCancel={onClose}
      onConfirm={() => {
        onConfirm(transaction.id)
        onClose()
      }}
      title="Borrar movimiento"
    />
  )
}

function TransactionsPage() {
  const { categories, accounts, getTransactions, getAvailableMonths, updateTransaction, deleteTransaction } =
    useFinance()

  const cats = categoryMap(categories)
  const accumulatorById = Object.fromEntries(accounts.map((a) => [a.id, a]))
  const months = getAvailableMonths()

  const {
    month, setMonth, categoryId, setCategoryId,
    accountId, setAccountId, type, setType,
    search, setSearch, sort, setSort,
    filterType, visibleCount, setVisibleCount,
    setFilter, resetFilters, hasFilters,
  } = useTransactionFilters()

  const allTransactions = getTransactions({ sort: 'date-desc' })
  const filtered = getTransactions({ month, categoryId, accountId, type: filterType, search, sort })

  const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = filtered
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const net = income - expenses

  const visibleTransactions = filtered.slice(0, visibleCount)
  const groups = groupTransactions(visibleTransactions, sort)
  const hasTransactions = allTransactions.length > 0

  const [editing, setEditing] = useState<Transaction | undefined>(undefined)
  const [deleting, setDeleting] = useState<Transaction | undefined>(undefined)

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__greeting">Tus finanzas</p>
          <h1 className="page-header__title">Movimientos</h1>
        </div>
        <AddTransactionButton />
      </header>

      <TransactionFilters
        accountId={accountId}
        accounts={accounts}
        categories={categories}
        categoryId={categoryId}
        hasFilters={hasFilters}
        month={month}
        months={months}
        resetFilters={resetFilters}
        search={search}
        setAccountId={setAccountId}
        setCategoryId={setCategoryId}
        setFilter={setFilter}
        setMonth={setMonth}
        setSearch={setSearch}
        setSort={setSort}
        setType={setType}
        sort={sort}
        type={type}
      />

      <TransactionSummary count={filtered.length} expenses={expenses} income={income} net={net} />

      <TransactionGroups
        accumulatorById={accumulatorById}
        cats={cats}
        filteredCount={filtered.length}
        groups={groups}
        hasFilters={hasFilters}
        hasTransactions={hasTransactions}
        onDelete={setDeleting}
        onEdit={setEditing}
        onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
        resetFilters={resetFilters}
        visibleCount={visibleTransactions.length}
      />

      {editing && (
        <EditTransactionModal
          accounts={accounts}
          categories={categories}
          onClose={() => setEditing(undefined)}
          onSave={updateTransaction}
          transaction={editing}
        />
      )}

      {deleting && (
        <DeleteTransactionModal
          onClose={() => setDeleting(undefined)}
          onConfirm={deleteTransaction}
          transaction={deleting}
        />
      )}
    </>
  )
}

export default TransactionsPage
