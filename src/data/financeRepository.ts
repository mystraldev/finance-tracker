import { seed } from './finance'
import {
  dateForMonthDay,
  hasUniqueIds,
  isFiniteNumber,
  isISODate,
  isMonthKey,
  isNonNegativeNumber,
  isPositiveNumber,
  isRecord,
  isString,
} from '../utils/validation'
import type {
  Account,
  Category,
  FinanceActivity,
  FinanceData,
  RecurringRule,
  RecurringSkip,
  SavingsGoal,
  Transaction,
  TransactionQuery,
  Transfer,
} from '../types/finance'

export const FINANCE_STORAGE_KEY = 'finance-tracker:v2'
export const FINANCE_BACKUP_APP = 'finance-tracker'
export const FINANCE_BACKUP_VERSION = 2
const SUPPORTED_BACKUP_VERSIONS = [1, 2]

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
  listActivities(data: FinanceData, query?: TransactionQuery): FinanceActivity[]
  availableMonths(data: FinanceData): string[]
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
    (value.budget === undefined || isPositiveNumber(value.budget))
  )
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isISODate(value.date) &&
    isFiniteNumber(value.amount) &&
    value.amount !== 0 &&
    isString(value.description) &&
    isString(value.accountId) &&
    isString(value.categoryId) &&
    (value.recurringRuleId === undefined || isString(value.recurringRuleId)) &&
    (value.recurrenceMonth === undefined || isMonthKey(value.recurrenceMonth))
  )
}

function isTransfer(value: unknown): value is Transfer {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isISODate(value.date) &&
    isPositiveNumber(value.amount) &&
    isString(value.description) &&
    isString(value.fromAccountId) &&
    isString(value.toAccountId) &&
    (value.recurringRuleId === undefined || isString(value.recurringRuleId)) &&
    (value.recurrenceMonth === undefined || isMonthKey(value.recurrenceMonth))
  )
}

function isSavingsGoal(value: unknown): value is SavingsGoal {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.name) &&
    isPositiveNumber(value.targetAmount) &&
    isNonNegativeNumber(value.savedAmount) &&
    value.savedAmount <= value.targetAmount &&
    isString(value.icon) &&
    isString(value.color) &&
    (value.accountId === undefined || isString(value.accountId)) &&
    (value.targetDate === undefined || isISODate(value.targetDate))
  )
}

function isRecurringRule(value: unknown): value is RecurringRule {
  if (!isRecord(value)) return false
  const base =
    isString(value.id) &&
    (value.type === 'income' || value.type === 'expense' || value.type === 'transfer') &&
    isString(value.description) &&
    isPositiveNumber(value.amount) &&
    isFiniteNumber(value.dayOfMonth) &&
    Number.isInteger(value.dayOfMonth) &&
    value.dayOfMonth >= 1 &&
    value.dayOfMonth <= 31 &&
    isMonthKey(value.startMonth) &&
    (value.endMonth === undefined || isMonthKey(value.endMonth)) &&
    (value.endMonth === undefined || value.endMonth >= value.startMonth) &&
    typeof value.active === 'boolean' &&
    value.frequency === 'monthly'

  if (!base) return false
  if (value.type === 'transfer') {
    return isString(value.fromAccountId) && isString(value.toAccountId)
  }
  return isString(value.accountId) && isString(value.categoryId)
}

function isRecurringSkip(value: unknown): value is RecurringSkip {
  if (!isRecord(value)) return false
  return (
    isString(value.id) &&
    isString(value.ruleId) &&
    isMonthKey(value.month)
  )
}

export function cloneFinanceData(data: FinanceData): FinanceData {
  return {
    accounts: data.accounts.map((a) => ({ ...a })),
    categories: data.categories.map((c) => ({ ...c })),
    transactions: data.transactions.map((t) => ({ ...t })),
    transfers: data.transfers.map((t) => ({ ...t })),
    recurringRules: data.recurringRules.map((r) => ({ ...r })),
    recurringSkips: data.recurringSkips.map((s) => ({ ...s })),
    savingsGoals: data.savingsGoals.map((g) => ({ ...g })),
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
  const transfers = value.transfers
  const recurringRules = value.recurringRules
  const recurringSkips = value.recurringSkips
  const savingsGoals = value.savingsGoals
  if (transfers !== undefined && !Array.isArray(transfers)) {
    return null
  }
  if (recurringRules !== undefined && !Array.isArray(recurringRules)) {
    return null
  }
  if (recurringSkips !== undefined && !Array.isArray(recurringSkips)) {
    return null
  }
  if (savingsGoals !== undefined && !Array.isArray(savingsGoals)) {
    return null
  }
  if (
    !value.accounts.every(isAccount) ||
    !value.categories.every(isCategory) ||
    !value.transactions.every(isTransaction) ||
    (Array.isArray(transfers) && !transfers.every(isTransfer)) ||
    (Array.isArray(recurringRules) && !recurringRules.every(isRecurringRule)) ||
    (Array.isArray(recurringSkips) && !recurringSkips.every(isRecurringSkip)) ||
    (Array.isArray(savingsGoals) && !savingsGoals.every(isSavingsGoal))
  ) {
    return null
  }

  const data = {
    accounts: value.accounts,
    categories: value.categories,
    transactions: value.transactions,
    transfers: Array.isArray(transfers) ? transfers : [],
    recurringRules: Array.isArray(recurringRules) ? recurringRules : [],
    recurringSkips: Array.isArray(recurringSkips) ? recurringSkips : [],
    savingsGoals: Array.isArray(savingsGoals) ? savingsGoals : [],
  }

  return hasValidReferences(data) ? cloneFinanceData(data) : null
}

export function parseFinanceBackup(value: unknown): FinanceData | null {
  if (!isRecord(value)) return null
  if (
    value.app !== FINANCE_BACKUP_APP ||
    !SUPPORTED_BACKUP_VERSIONS.includes(Number(value.version)) ||
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

export function listActivities(
  data: FinanceData,
  query: TransactionQuery = {},
): FinanceActivity[] {
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

  const transactionActivities = data.transactions.map<FinanceActivity>((transaction) => ({
    kind: 'transaction',
    ...transaction,
  }))
  const transferActivities = data.transfers.map<FinanceActivity>((transfer) => ({
    kind: 'transfer',
    ...transfer,
  }))

  const activities = [...transactionActivities, ...transferActivities]
    .filter((activity) => month === 'all' || transactionMonthKey(activity.date) === month)
    .filter((activity) => {
      if (activity.kind === 'transfer') {
        return accountId === 'all' || activity.fromAccountId === accountId || activity.toAccountId === accountId
      }
      return accountId === 'all' || activity.accountId === accountId
    })
    .filter((activity) => {
      if (activity.kind === 'transfer') return categoryId === 'all'
      return categoryId === 'all' || activity.categoryId === categoryId
    })
    .filter((activity) => {
      if (type === 'all') return true
      if (type === 'transfer') return activity.kind === 'transfer'
      if (activity.kind === 'transfer') return false
      return type === 'income' ? activity.amount > 0 : activity.amount < 0
    })
    .filter((activity) => {
      if (!needle) return true
      const haystack =
        activity.kind === 'transfer'
          ? [
              activity.description,
              accounts.get(activity.fromAccountId)?.name ?? '',
              accounts.get(activity.toAccountId)?.name ?? '',
              'traspaso transferencia',
            ].join(' ')
          : [
              activity.description,
              categories.get(activity.categoryId)?.label ?? '',
              accounts.get(activity.accountId)?.name ?? '',
            ].join(' ')
      return normaliseSearch(haystack).includes(needle)
    })

  const sorted =
    sort === 'none'
      ? activities
      : [...activities].sort((a, b) => {
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
  const set = new Set([
    ...data.transactions.map((t) => transactionMonthKey(t.date)),
    ...data.transfers.map((t) => transactionMonthKey(t.date)),
  ])
  return [...set].sort((a, b) => (a < b ? 1 : -1))
}

function hasValidReferences(data: FinanceData): boolean {
  const accounts = new Set(data.accounts.map((account) => account.id))
  const categories = new Set(data.categories.map((category) => category.id))
  const rules = new Set(data.recurringRules.map((rule) => rule.id))

  if (
    !hasUniqueIds(data.accounts) ||
    !hasUniqueIds(data.categories) ||
    !hasUniqueIds(data.transactions) ||
    !hasUniqueIds(data.transfers) ||
    !hasUniqueIds(data.recurringRules) ||
    !hasUniqueIds(data.recurringSkips) ||
    !hasUniqueIds(data.savingsGoals)
  ) {
    return false
  }

  if (
    data.transactions.some(
      (transaction) =>
        !accounts.has(transaction.accountId) ||
        !categories.has(transaction.categoryId) ||
        (transaction.recurringRuleId && !rules.has(transaction.recurringRuleId)),
    )
  ) {
    return false
  }

  if (
    data.transfers.some(
      (transfer) =>
        !accounts.has(transfer.fromAccountId) ||
        !accounts.has(transfer.toAccountId) ||
        transfer.fromAccountId === transfer.toAccountId ||
        (transfer.recurringRuleId && !rules.has(transfer.recurringRuleId)),
    )
  ) {
    return false
  }

  if (
    data.savingsGoals.some(
      (goal) => goal.accountId !== undefined && !accounts.has(goal.accountId),
    )
  ) {
    return false
  }

  if (
    data.recurringRules.some((rule) => {
      const safeDate = dateForMonthDay(rule.startMonth, rule.dayOfMonth)
      if (!isISODate(safeDate)) return true
      if (rule.type === 'transfer') {
        return (
          !accounts.has(rule.fromAccountId) ||
          !accounts.has(rule.toAccountId) ||
          rule.fromAccountId === rule.toAccountId
        )
      }
      return !accounts.has(rule.accountId) || !categories.has(rule.categoryId)
    })
  ) {
    return false
  }

  return data.recurringSkips.every((skip) => rules.has(skip.ruleId))
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
    listActivities,
    availableMonths: availableTransactionMonths,
  }
}

export const financeRepository = createLocalStorageFinanceRepository()
