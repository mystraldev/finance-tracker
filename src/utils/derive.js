import { fractionOf } from './math'

// ---------- Utilidades de mes ----------

/** Clave de mes 'yyyy-mm' a partir de una fecha ISO 'yyyy-mm-dd'. */
export function monthKey(date) {
  return String(date).slice(0, 7)
}

/** Mes actual en formato 'yyyy-mm'. */
export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Desplaza un mes 'yyyy-mm' en `delta` meses (positivo o negativo). */
export function addMonths(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** Lista de n meses consecutivos que termina en `endMonth` (incluido). */
export function monthsBack(endMonth, n) {
  const [y, m] = endMonth.split('-').map(Number)
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

const longMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const shortMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  timeZone: 'UTC',
})

function monthDate(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1))
}

/** 'Junio 2026' a partir de 'yyyy-mm'. */
export function monthLabel(month) {
  const text = longMonthFormatter.format(monthDate(month))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** 'jun' a partir de 'yyyy-mm'. */
export function shortMonthLabel(month) {
  return shortMonthFormatter.format(monthDate(month)).replace('.', '')
}

// ---------- Selectores de movimientos ----------

/** Movimientos de un mes concreto. */
export function monthTransactions(transactions, month) {
  return transactions.filter((t) => monthKey(t.date) === month)
}

/** Meses con movimientos, en formato 'yyyy-mm', de más reciente a más antiguo. */
export function availableMonths(transactions) {
  const set = new Set(transactions.map((t) => monthKey(t.date)))
  return [...set].sort((a, b) => (a < b ? 1 : -1))
}

/** Ingresos, gastos y ahorro de un mes. */
export function incomeExpenses(transactions, month) {
  const m = monthTransactions(transactions, month)
  const income = m.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = m
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expenses, saved: income - expenses }
}

// ---------- Saldos y patrimonio ----------

/** Saldo de una cuenta al cierre de `month` (o actual si month es null). */
export function accountBalanceAsOf(account, transactions, month = null) {
  const sum = transactions
    .filter((t) => t.accountId === account.id && (!month || monthKey(t.date) <= month))
    .reduce((s, t) => s + t.amount, 0)
  return account.openingBalance + sum
}

/** Cuentas con su saldo derivado al cierre de `month`. */
export function accountsWithBalance(state, month = null) {
  return state.accounts.map((a) => ({
    ...a,
    balance: accountBalanceAsOf(a, state.transactions, month),
  }))
}

/** Patrimonio total al cierre de `month`. */
export function netWorthAsOf(state, month = null) {
  return state.accounts.reduce(
    (sum, a) => sum + accountBalanceAsOf(a, state.transactions, month),
    0,
  )
}

/** Variación del saldo de una cuenta respecto al mes anterior. */
export function monthlyChange(account, transactions, month) {
  const [prev] = monthsBack(month, 2)
  const cur = accountBalanceAsOf(account, transactions, month)
  const before = accountBalanceAsOf(account, transactions, prev)
  return fractionOf(cur - before, before)
}

// ---------- Series para sparklines ----------

/** Serie del patrimonio en los últimos n meses → [{ label, value }]. */
export function netWorthSeries(state, n, endMonth) {
  return monthsBack(endMonth, n).map((m) => ({
    label: shortMonthLabel(m),
    value: netWorthAsOf(state, m),
  }))
}

/** Serie de saldos de una cuenta en los últimos n meses → [number]. */
export function accountSeries(account, transactions, n, endMonth) {
  return monthsBack(endMonth, n).map((m) =>
    accountBalanceAsOf(account, transactions, m),
  )
}

// ---------- Categorías ----------

/** Mapa id → categoría, para resolver etiqueta/icono rápido. */
export function categoryMap(categories) {
  return Object.fromEntries(categories.map((c) => [c.id, c]))
}

/** Gasto por categoría en un mes (solo gastos), ordenado de mayor a menor. */
export function categoryBreakdown(transactions, categories, month) {
  const totals = new Map()
  monthTransactions(transactions, month)
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      totals.set(t.categoryId, (totals.get(t.categoryId) || 0) + Math.abs(t.amount))
    })
  return categories
    .map((c) => ({ ...c, amount: totals.get(c.id) || 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

// ---------- Movimientos recientes (enriquecidos para la UI) ----------

/** Últimos n movimientos con la etiqueta e icono de su categoría resueltos. */
export function recentTransactions(state, n = 6) {
  const cats = categoryMap(state.categories)
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, n)
    .map((t) => ({
      ...t,
      category: cats[t.categoryId]?.label ?? 'Sin categoría',
      icon: cats[t.categoryId]?.icon ?? 'package',
    }))
}
