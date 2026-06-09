import { seed } from './finance'
import type { Account, Category, FinanceData, Transaction, TransactionQuery } from '../types/finance'

export const FINANCE_STORAGE_KEY = 'finance-tracker:v2'
export const FINANCE_BACKUP_APP = 'finance-tracker'
export const FINANCE_BACKUP_VERSION = 1

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export type FinanceBackup = {
  app: typeof FINANCE_BACKUP_APP
  version: typeof FINANCE_BACKUP_VERSION
  exportedAt: string
  data: FinanceData
}

export interface FinanceRepository {
  load(): FinanceData
  save(data: FinanceData): void
  seed(): FinanceData
  listTransactions(data: FinanceData, query?: TransactionQuery): Transaction[]
  availableMonths(data: FinanceData): string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isAccount(value: unknown): value is Account {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.name) &&
    (value.type === 'cash' || value.type === 'savings' || value.type === 'investment') &&
    isString(value.icon) &&
    isString(value.accent) &&
    isFiniteNumber(value.openingBalance) &&
    (value.interestRate === undefined || isFiniteNumber(value.interestRate))
  )
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.label) &&
    isString(value.icon) &&
    isString(value.color) &&
    (value.budget === undefined || isFiniteNumber(value.budget))
  )
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.date) &&
    isFiniteNumber(value.amount) &&
    isString(value.description) &&
    isString(value.accountId) &&
    isString(value.categoryId)
  )
}

export function cloneFinanceData(data: FinanceData): FinanceData {
  return {
    accounts: data.accounts.map((a) => ({ ...a })),
    categories: data.categories.map((c) => ({ ...c })),
    transactions: data.transactions.map((t) => ({ ...t })),
  }
}

export function createFinanceBackup(
  data: FinanceData,
  exportedAt = new Date().toISOString(),
): FinanceBackup {
  return {
    app: FINANCE_BACKUP_APP,
    version: FINANCE_BACKUP_VERSION,
    exportedAt,
    data: cloneFinanceData(data),
  }
}

export function parseFinanceData(value: unknown): FinanceData | null {
  if (!isRecord(value)) return null
  if (
    !Array.isArray(value.accounts) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.transactions)
  ) {
    return null
  }
  if (
    !value.accounts.every(isAccount) ||
    !value.categories.every(isCategory) ||
    !value.transactions.every(isTransaction)
  ) {
    return null
  }
  return cloneFinanceData({
    accounts: value.accounts,
    categories: value.categories,
    transactions: value.transactions,
  })
}

export function parseFinanceBackup(value: unknown): FinanceData | null {
  if (!isRecord(value)) return null
  if (
    value.app !== FINANCE_BACKUP_APP ||
    value.version !== FINANCE_BACKUP_VERSION ||
    !isString(value.exportedAt)
  ) {
    return null
  }
  return parseFinanceData(value.data)
}

export function transactionMonthKey(date: string): string {
  return String(date).slice(0, 7)
}

function normaliseSearch(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase('es-ES')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function listTransactions(
  data: FinanceData,
  query: TransactionQuery = {},
): Transaction[] {
  const {
    month = 'all',
    categoryId = 'all',
    accountId = 'all',
    type = 'all',
    sort = 'none',
    search = '',
    limit,
  } = query

  const needle = normaliseSearch(search)
  const categories = new Map(data.categories.map((c) => [c.id, c]))
  const accounts = new Map(data.accounts.map((a) => [a.id, a]))

  const transactions = data.transactions
    .filter((t) => month === 'all' || transactionMonthKey(t.date) === month)
    .filter((t) => categoryId === 'all' || t.categoryId === categoryId)
    .filter((t) => accountId === 'all' || t.accountId === accountId)
    .filter((t) =>
      type === 'all' ? true : type === 'income' ? t.amount > 0 : t.amount < 0,
    )
    .filter((t) => {
      if (!needle) return true
      const haystack = [
        t.description,
        categories.get(t.categoryId)?.label ?? '',
        accounts.get(t.accountId)?.name ?? '',
      ].join(' ')
      return normaliseSearch(haystack).includes(needle)
    })

  const sorted =
    sort === 'none'
      ? transactions
      : [...transactions].sort((a, b) => {
          if (sort === 'amount-desc' || sort === 'amount-asc') {
            const byAmount = Math.abs(b.amount) - Math.abs(a.amount)
            return sort === 'amount-desc' ? byAmount : -byAmount
          }
          if (a.date === b.date) return 0
          return sort === 'date-desc'
            ? a.date < b.date ? 1 : -1
            : a.date < b.date ? -1 : 1
        })

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function availableTransactionMonths(data: FinanceData): string[] {
  const set = new Set(data.transactions.map((t) => transactionMonthKey(t.date)))
  return [...set].sort((a, b) => (a < b ? 1 : -1))
}

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function createLocalStorageFinanceRepository({
  key = FINANCE_STORAGE_KEY,
  storage,
  seedData = seed,
}: {
  key?: string
  storage?: StorageLike
  seedData?: FinanceData
} = {}): FinanceRepository {
  const getSeed = () => cloneFinanceData(seedData)

  return {
    load() {
      const target = resolveStorage(storage)
      if (!target) return getSeed()

      try {
        const raw = target.getItem(key)
        if (!raw) return getSeed()
        return parseFinanceData(JSON.parse(raw)) ?? getSeed()
      } catch {
        return getSeed()
      }
    },

    save(data) {
      const target = resolveStorage(storage)
      if (!target) return

      try {
        target.setItem(key, JSON.stringify(cloneFinanceData(data)))
      } catch {
        /* storage not available */
      }
    },

    seed: getSeed,
    listTransactions,
    availableMonths: availableTransactionMonths,
  }
}

export const financeRepository = createLocalStorageFinanceRepository()
