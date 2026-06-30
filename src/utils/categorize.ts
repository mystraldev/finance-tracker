import type { Transaction } from '../types/finance'

/** Normalised key for matching transactions by description (case/space-insensitive). */
export function normalizeDescription(description: string): string {
  return description.trim().toLowerCase()
}

/**
 * Other transactions that share `description` but have a different category —
 * i.e. the candidates to re-categorise when the user changes one of them.
 */
export function sameDescriptionTransactions(
  transactions: Transaction[],
  excludeId: string,
  description: string,
  newCategoryId: string,
): Transaction[] {
  const key = normalizeDescription(description)
  return transactions.filter(
    (t) => t.id !== excludeId && t.categoryId !== newCategoryId && normalizeDescription(t.description) === key,
  )
}

/** Map of description -> category learned from existing transactions, for auto-categorising imports. */
export function categoryRulesFrom(transactions: Transaction[]): Map<string, string> {
  const rules = new Map<string, string>()
  for (const t of transactions) {
    rules.set(normalizeDescription(t.description), t.categoryId)
  }
  return rules
}
