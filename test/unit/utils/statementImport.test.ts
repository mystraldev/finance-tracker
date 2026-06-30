import type { FinanceData } from '../../../src/types/finance'
import type { ParsedStatement } from '../../../src/utils/statementParser'

import { describe, expect, it } from 'vitest'

import { buildImportPlan } from '../../../src/utils/statementImport'

function ids() {
  let n = 0
  return () => `id-${n++}`
}

const statement: ParsedStatement = {
  accounts: [
    {
      name: 'Cuenta personal',
      openingBalance: 100,
      transactions: [
        { date: '2026-01-01', description: 'A', category: 'Comercio', amount: -10, balance: 90 },
        { date: '2026-01-02', description: 'B', category: 'Recargar', amount: 50, balance: 140 },
        { date: '2026-01-02', description: 'B', category: 'Recargar', amount: 50, balance: 190 },
      ],
    },
  ],
}

const empty: Pick<FinanceData, 'accounts' | 'categories' | 'transactions'> = {
  accounts: [],
  categories: [],
  transactions: [],
}

describe('buildImportPlan', () => {
  it('creates accounts, mapped categories and transactions on a clean import', () => {
    const plan = buildImportPlan(statement, empty, ids())

    expect(plan.newAccounts).toHaveLength(1)
    expect(plan.newAccounts[0]).toMatchObject({ name: 'Cuenta personal', openingBalance: 100, type: 'cash' })
    expect(plan.newCategories.map((c) => c.label)).toEqual(['Compras', 'Ingresos'])
    expect(plan.newTransactions).toHaveLength(3)
    expect(plan.duplicates).toBe(0)
    expect(plan.totalParsed).toBe(3)
  })

  it('reuses the same app category for repeated Revolut categories', () => {
    const plan = buildImportPlan(statement, empty, ids())
    const ingresos = plan.newCategories.find((c) => c.label === 'Ingresos')
    const recargarTxs = plan.newTransactions.filter((t) => t.description === 'B')
    expect(recargarTxs.every((t) => t.categoryId === ingresos?.id)).toBe(true)
  })

  it('keeps genuine repeated charges within the same statement', () => {
    const plan = buildImportPlan(statement, empty, ids())
    expect(plan.newTransactions.filter((t) => t.description === 'B' && t.amount === 50)).toHaveLength(2)
  })

  it('reuses an existing account matched by name instead of creating one', () => {
    const existing = {
      accounts: [{ id: 'acc-x', name: 'Cuenta personal', type: 'cash' as const, icon: 'wallet', accent: 'indigo', openingBalance: 0 }],
      categories: [],
      transactions: [],
    }
    const plan = buildImportPlan(statement, existing, ids())
    expect(plan.newAccounts).toHaveLength(0)
    expect(plan.newTransactions.every((t) => t.accountId === 'acc-x')).toBe(true)
  })

  it('de-dupes transactions already stored for the account', () => {
    const existing = {
      accounts: [{ id: 'acc-x', name: 'Cuenta personal', type: 'cash' as const, icon: 'wallet', accent: 'indigo', openingBalance: 0 }],
      categories: [],
      transactions: [
        { id: 't0', date: '2026-01-01', amount: -10, description: 'A', accountId: 'acc-x', categoryId: 'c0' },
      ],
    }
    const plan = buildImportPlan(statement, existing, ids())
    expect(plan.duplicates).toBe(1)
    expect(plan.newTransactions.some((t) => t.description === 'A')).toBe(false)
    expect(plan.newTransactions).toHaveLength(2)
  })
})
