import type { Account, Category, FinanceData, SavingsGoal, Transaction } from '../types/finance'

import { supabase } from '../lib/supabase'
import { randomUUID } from '../utils/uuid'

/**
 * Supabase-backed persistence. Reads are RLS-scoped to the user; writes set
 * `user_id` for the RLS `with check` policy. Numeric columns may come back as
 * strings, so they are coerced.
 */

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

export function newId(): string {
  return randomUUID()
}

// ---------------------------------------------------------------------------
// Row shapes (snake_case, as stored in Postgres)
// ---------------------------------------------------------------------------

type AccountRow = {
  id: string
  name: string
  type: Account['type']
  icon: string
  accent: string
  opening_balance: number | string
  interest_rate: number | string | null
}

type CategoryRow = {
  id: string
  label: string
  icon: string
  color: string
  budget: number | string | null
}

type TransactionRow = {
  id: string
  date: string
  amount: number | string
  description: string
  account_id: string
  category_id: string
}

type SavingsGoalRow = {
  id: string
  name: string
  target_amount: number | string
  saved_amount: number | string
  icon: string
  color: string
  account_id: string | null
  target_date: string | null
}

// ---------------------------------------------------------------------------
// Row -> model
// ---------------------------------------------------------------------------

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value)
}

function optionalNumber(value: number | string | null): number | undefined {
  if (value === null || value === undefined) return undefined
  return toNumber(value)
}

function optionalString(value: string | null): string | undefined {
  if (value === null || value === undefined) return undefined
  return value
}

function toAccount(row: AccountRow): Account {
  const account: Account = {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    accent: row.accent,
    openingBalance: toNumber(row.opening_balance),
  }
  const interestRate = optionalNumber(row.interest_rate)
  if (interestRate !== undefined) account.interestRate = interestRate
  return account
}

function toCategory(row: CategoryRow): Category {
  const category: Category = { id: row.id, label: row.label, icon: row.icon, color: row.color }
  const budget = optionalNumber(row.budget)
  if (budget !== undefined) category.budget = budget
  return category
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    amount: toNumber(row.amount),
    description: row.description,
    accountId: row.account_id,
    categoryId: row.category_id,
  }
}

function toSavingsGoal(row: SavingsGoalRow): SavingsGoal {
  const goal: SavingsGoal = {
    id: row.id,
    name: row.name,
    targetAmount: toNumber(row.target_amount),
    savedAmount: toNumber(row.saved_amount),
    icon: row.icon,
    color: row.color,
  }
  const accountId = optionalString(row.account_id)
  if (accountId !== undefined) goal.accountId = accountId
  const targetDate = optionalString(row.target_date)
  if (targetDate !== undefined) goal.targetDate = targetDate
  return goal
}

// ---------------------------------------------------------------------------
// Model -> insert/upsert row (optional fields omitted when absent)
// ---------------------------------------------------------------------------

function accountRow(userId: string, account: Account): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: account.id,
    user_id: userId,
    name: account.name,
    type: account.type,
    icon: account.icon,
    accent: account.accent,
    opening_balance: account.openingBalance,
  }
  if (account.interestRate !== undefined) row.interest_rate = account.interestRate
  return row
}

function categoryRow(userId: string, category: Category): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: category.id,
    user_id: userId,
    label: category.label,
    icon: category.icon,
    color: category.color,
  }
  if (category.budget !== undefined) row.budget = category.budget
  return row
}

function transactionRow(userId: string, transaction: Transaction): Record<string, unknown> {
  return {
    id: transaction.id,
    user_id: userId,
    date: transaction.date,
    amount: transaction.amount,
    description: transaction.description,
    account_id: transaction.accountId,
    category_id: transaction.categoryId,
  }
}

function savingsGoalRow(userId: string, goal: SavingsGoal): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: goal.id,
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    saved_amount: goal.savedAmount,
    icon: goal.icon,
    color: goal.color,
  }
  if (goal.accountId !== undefined) row.account_id = goal.accountId
  if (goal.targetDate !== undefined) row.target_date = goal.targetDate
  return row
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

async function selectAll<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return (data ?? []) as T[]
}

export async function fetchFinanceData(): Promise<FinanceData> {
  const [accounts, categories, transactions, savingsGoals] = await Promise.all([
    selectAll<AccountRow>('accounts'),
    selectAll<CategoryRow>('categories'),
    selectAll<TransactionRow>('transactions'),
    selectAll<SavingsGoalRow>('savings_goals'),
  ])
  return {
    accounts: accounts.map((row) => toAccount(row)),
    categories: categories.map((row) => toCategory(row)),
    transactions: transactions.map((row) => toTransaction(row)),
    savingsGoals: savingsGoals.map((row) => toSavingsGoal(row)),
  }
}

// ---------------------------------------------------------------------------
// Writes (one entity)
// ---------------------------------------------------------------------------

async function upsert(table: string, row: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(table).upsert(row)
  if (error) throw error
}

async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export const upsertAccount = (userId: string, account: Account) =>
  upsert('accounts', accountRow(userId, account))
export const upsertCategory = (userId: string, category: Category) =>
  upsert('categories', categoryRow(userId, category))
export const upsertTransaction = (userId: string, transaction: Transaction) =>
  upsert('transactions', transactionRow(userId, transaction))
export const upsertSavingsGoal = (userId: string, goal: SavingsGoal) =>
  upsert('savings_goals', savingsGoalRow(userId, goal))

export const deleteAccount = (id: string) => remove('accounts', id)
export const deleteCategory = (id: string) => remove('categories', id)
export const deleteTransaction = (id: string) => remove('transactions', id)
export const deleteSavingsGoal = (id: string) => remove('savings_goals', id)

// ---------------------------------------------------------------------------
// Bulk operations (clear all, import)
// ---------------------------------------------------------------------------

async function clearTable(table: string): Promise<void> {
  const { error } = await supabase.from(table).delete().neq('id', NIL_UUID)
  if (error) throw error
}

async function insertMany(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).insert(rows)
  if (error) throw error
}

/** Delete every row owned by the user (RLS scopes the deletes). FK-safe order. */
export async function clearAllData(): Promise<void> {
  await clearTable('transactions')
  await clearTable('savings_goals')
  await clearTable('accounts')
  await clearTable('categories')
}

/** Replace all of the user's data with `data` (assumes valid UUID ids). */
export async function replaceAllData(userId: string, data: FinanceData): Promise<void> {
  await clearAllData()
  await bulkInsert(userId, data)
  await insertMany('savings_goals', data.savingsGoals.map((g) => savingsGoalRow(userId, g)))
}

/** Append accounts, categories and transactions (FK-safe order). For imports. */
export async function bulkInsert(
  userId: string,
  data: { accounts: Account[]; categories: Category[]; transactions: Transaction[] },
): Promise<void> {
  await insertMany('accounts', data.accounts.map((a) => accountRow(userId, a)))
  await insertMany('categories', data.categories.map((c) => categoryRow(userId, c)))
  await insertMany('transactions', data.transactions.map((t) => transactionRow(userId, t)))
}

/**
 * Remap every id to a fresh UUID while preserving foreign-key references.
 * Needed when importing a backup whose ids are not UUIDs (e.g. the old
 * localStorage seed used semantic ids like `checking`/`income`).
 */
export function remapFinanceData(data: FinanceData): FinanceData {
  const accountIds = new Map(data.accounts.map((a) => [a.id, newId()]))
  const categoryIds = new Map(data.categories.map((c) => [c.id, newId()]))

  return {
    accounts: data.accounts.map((a) => ({ ...a, id: accountIds.get(a.id) ?? a.id })),
    categories: data.categories.map((c) => ({ ...c, id: categoryIds.get(c.id) ?? c.id })),
    transactions: data.transactions.map((t) => ({
      ...t,
      id: newId(),
      accountId: accountIds.get(t.accountId) ?? t.accountId,
      categoryId: categoryIds.get(t.categoryId) ?? t.categoryId,
    })),
    savingsGoals: data.savingsGoals.map((g) => ({
      ...g,
      id: newId(),
      accountId: g.accountId === undefined ? undefined : accountIds.get(g.accountId) ?? g.accountId,
    })),
  }
}
