import type { Account, Category, FinanceData, Transaction } from '../types/finance'
import type { BalanceAccount, ParsedStatement } from './statementParser'

import { randomUUID } from './uuid'

/**
 * Turns a parsed statement into a concrete set of inserts for the app:
 * new accounts, new categories and de-duplicated transactions, mapping
 * Revolut categories to app categories along the way.
 */

export type ImportPlan = {
  newAccounts: Account[]
  /** Existing savings/investment accounts whose balance changed in this statement. */
  updatedAccounts: Account[]
  newCategories: Category[]
  newTransactions: Transaction[]
  /** Parsed rows skipped because they already exist in the app. */
  duplicates: number
  /** Total parsed rows considered. */
  totalParsed: number
}

type CategoryStyle = { label: string; icon: string; color: string }

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  Comercio: { label: 'Compras', icon: 'cart', color: '#10b981' },
  Recargar: { label: 'Ingresos', icon: 'salary', color: '#22c55e' },
  Cambio: { label: 'Cambio de divisa', icon: 'trending', color: '#8d66d9' },
  Reembolso: { label: 'Reembolsos', icon: 'health', color: '#06b6d4' },
  Otras: { label: 'Otros', icon: 'package', color: '#94a3b8' },
}

const FALLBACK_CATEGORY: CategoryStyle = { label: 'Otros', icon: 'package', color: '#94a3b8' }

function mapCategory(revolutCategory: string): CategoryStyle {
  return CATEGORY_MAP[revolutCategory] ?? FALLBACK_CATEGORY
}

function transactionKey(date: string, amount: number, description: string): string {
  return `${date}|${amount.toFixed(2)}|${description.trim().toLowerCase()}`
}

function defaultIdFactory(): string {
  return randomUUID()
}

const ACCOUNT_STYLE: Record<BalanceAccount['type'], { icon: string; accent: string }> = {
  savings: { icon: 'piggy', accent: 'emerald' },
  investment: { icon: 'trending', accent: 'violet' },
}

/** Decide whether a savings/investment account should be created or have its balance refreshed. */
function planBalanceAccount(
  balanceAccount: BalanceAccount,
  existingAccounts: Account[],
  idFactory: () => string,
): { created?: Account; updated?: Account } {
  const current = existingAccounts.find((a) => a.name === balanceAccount.name)
  if (current) {
    if (current.openingBalance === balanceAccount.balance) return {}
    return { updated: { ...current, openingBalance: balanceAccount.balance } }
  }
  const style = ACCOUNT_STYLE[balanceAccount.type]
  return {
    created: {
      id: idFactory(),
      name: balanceAccount.name,
      type: balanceAccount.type,
      icon: style.icon,
      accent: style.accent,
      openingBalance: balanceAccount.balance,
    },
  }
}

export function buildImportPlan(
  statement: ParsedStatement,
  existing: Pick<FinanceData, 'accounts' | 'categories' | 'transactions'>,
  idFactory: () => string = defaultIdFactory,
): ImportPlan {
  const newAccounts: Account[] = []
  const updatedAccounts: Account[] = []
  const newCategories: Category[] = []
  const newTransactions: Transaction[] = []
  let duplicates = 0
  let totalParsed = 0

  const categoryIdByLabel = new Map(existing.categories.map((c) => [c.label, c.id]))
  const accountIdByName = new Map(existing.accounts.map((a) => [a.name, a.id]))

  function ensureCategory(revolutCategory: string): string {
    const style = mapCategory(revolutCategory)
    const known = categoryIdByLabel.get(style.label)
    if (known) return known
    const id = idFactory()
    newCategories.push({ id, label: style.label, icon: style.icon, color: style.color })
    categoryIdByLabel.set(style.label, id)
    return id
  }

  for (const account of statement.accounts) {
    let accountId = accountIdByName.get(account.name)
    if (!accountId) {
      accountId = idFactory()
      newAccounts.push({
        id: accountId,
        name: account.name,
        type: 'cash',
        icon: 'wallet',
        accent: 'indigo',
        openingBalance: account.openingBalance,
      })
      accountIdByName.set(account.name, accountId)
    }

    // Only de-dupe against transactions already stored for this account, so
    // genuine repeated charges within one statement are kept.
    const existingKeys = new Set(
      existing.transactions
        .filter((t) => t.accountId === accountId)
        .map((t) => transactionKey(t.date, t.amount, t.description)),
    )

    for (const tx of account.transactions) {
      totalParsed += 1
      if (existingKeys.has(transactionKey(tx.date, tx.amount, tx.description))) {
        duplicates += 1
      } else {
        newTransactions.push({
          id: idFactory(),
          date: tx.date,
          amount: tx.amount,
          description: tx.description,
          accountId,
          categoryId: ensureCategory(tx.category),
        })
      }
    }
  }

  for (const balanceAccount of statement.balanceAccounts) {
    const { created, updated } = planBalanceAccount(balanceAccount, existing.accounts, idFactory)
    if (created) newAccounts.push(created)
    if (updated) updatedAccounts.push(updated)
  }

  return { newAccounts, updatedAccounts, newCategories, newTransactions, duplicates, totalParsed }
}
