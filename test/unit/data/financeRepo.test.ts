import type { FinanceData } from '../../../src/types/finance'

import { describe, expect, it } from 'vitest'

import {
  availableTransactionMonths,
  cloneFinanceData,
  createFinanceBackup,
  createLocalStorageFinanceRepo,
  FINANCE_BACKUP_APP,
  FINANCE_BACKUP_VERSION,
  FINANCE_RECOVERY_SUFFIX,
  FINANCE_STORAGE_KEY,
  listTransactions,
  parseFinanceBackup,
  parseFinanceData,
  transactionMonthKey,
} from '../../../src/data/financeRepo'

const data: FinanceData = {
  accounts: [
    {
      id: 'checking',
      name: 'Checking',
      type: 'cash',
      icon: 'wallet',
      accent: 'indigo',
      openingBalance: 1000,
    },
    {
      id: 'savings',
      name: 'Savings',
      type: 'savings',
      icon: 'piggy',
      accent: 'emerald',
      openingBalance: 5000,
      interestRate: 0.02,
    },
  ],
  categories: [
    { id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' },
    { id: 'home', label: 'Home', color: '#6366f1', icon: 'home', budget: 700 },
    { id: 'food', label: 'Food', color: '#10b981', icon: 'cart' },
  ],
  transactions: [
    {
      id: 't1',
      date: '2026-05-01',
      amount: 2000,
      description: 'Salary',
      accountId: 'checking',
      categoryId: 'income',
    },
    {
      id: 't2',
      date: '2026-05-10',
      amount: -500,
      description: 'Rent',
      accountId: 'checking',
      categoryId: 'home',
    },
    {
      id: 't3',
      date: '2026-06-01',
      amount: 2000,
      description: 'Salary',
      accountId: 'checking',
      categoryId: 'income',
    },
    {
      id: 't4',
      date: '2026-06-05',
      amount: -600,
      description: 'Rent',
      accountId: 'checking',
      categoryId: 'home',
    },
    {
      id: 't5',
      date: '2026-06-12',
      amount: -150,
      description: 'Groceries',
      accountId: 'checking',
      categoryId: 'food',
    },
    {
      id: 't6',
      date: '2026-06-20',
      amount: -25,
      description: 'Snacks',
      accountId: 'savings',
      categoryId: 'food',
    },
    {
      id: 't7',
      date: '2026-06-25',
      amount: -40,
      description: 'Café',
      accountId: 'checking',
      categoryId: 'food',
    },
  ],
  savingsGoals: [
    {
      id: 'goal',
      name: 'Emergency fund',
      targetAmount: 6000,
      savedAmount: 1000,
      icon: 'piggy',
      color: '#10b981',
      accountId: 'savings',
    },
  ],
}

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    value: (key: string) => values.get(key),
  }
}

describe('financeRepo storage', () => {
  it('loads persisted finance data from storage', () => {
    const storage = createMemoryStorage({
      [FINANCE_STORAGE_KEY]: JSON.stringify(data),
    })
    const repo = createLocalStorageFinanceRepo({ storage })

    expect(repo.load()).toEqual(data)
  })

  it('falls back to seed data when storage is empty or invalid', () => {
    const storage = createMemoryStorage({
      [FINANCE_STORAGE_KEY]: JSON.stringify({ accounts: [], transactions: [] }),
    })
    const repo = createLocalStorageFinanceRepo({ storage, seedData: data })

    expect(repo.load()).toEqual(data)
  })

  it('stashes schema-invalid payloads under the recovery key before seeding', () => {
    const invalid = JSON.stringify({ accounts: [], transactions: [] })
    const storage = createMemoryStorage({ [FINANCE_STORAGE_KEY]: invalid })
    const repo = createLocalStorageFinanceRepo({ storage, seedData: data })

    expect(repo.load()).toEqual(data)
    expect(storage.value(`${FINANCE_STORAGE_KEY}${FINANCE_RECOVERY_SUFFIX}`)).toBe(invalid)
  })

  it('stashes unparseable JSON under the recovery key before seeding', () => {
    const storage = createMemoryStorage({ [FINANCE_STORAGE_KEY]: 'not-json{' })
    const repo = createLocalStorageFinanceRepo({ storage, seedData: data })

    expect(repo.load()).toEqual(data)
    expect(storage.value(`${FINANCE_STORAGE_KEY}${FINANCE_RECOVERY_SUFFIX}`)).toBe('not-json{')
  })

  it('does not write a recovery entry when storage is empty or valid', () => {
    const storage = createMemoryStorage({ [FINANCE_STORAGE_KEY]: JSON.stringify(data) })
    const repo = createLocalStorageFinanceRepo({ storage })

    repo.load()

    expect(storage.value(`${FINANCE_STORAGE_KEY}${FINANCE_RECOVERY_SUFFIX}`)).toBeUndefined()
  })

  it('saves cloned finance data to storage', () => {
    const storage = createMemoryStorage()
    const repo = createLocalStorageFinanceRepo({ storage })

    repo.save(data)

    expect(JSON.parse(storage.value(FINANCE_STORAGE_KEY) ?? '{}')).toEqual(data)
  })

  it('returns fresh clones for seed and loaded data', () => {
    const repo = createLocalStorageFinanceRepo({ seedData: data })
    const first = repo.seed()
    const second = repo.seed()

    first.accounts[0].name = 'Changed'

    expect(second.accounts[0].name).toBe('Checking')
  })
})

describe('financeRepo validation', () => {
  it('parses complete finance data and rejects malformed data', () => {
    expect(parseFinanceData(data)).toEqual(data)
    expect(parseFinanceData({ ...data, savingsGoals: undefined })).toEqual({
      ...data,
      savingsGoals: [],
    })
    expect(parseFinanceData({ ...data, categories: undefined })).toBeUndefined()
    expect(
      parseFinanceData({ ...data, transactions: [{ ...data.transactions[0], amount: '10' }] }),
    ).toBeUndefined()
    expect(
      parseFinanceData({ ...data, savingsGoals: [{ ...data.savingsGoals[0], savedAmount: '10' }] }),
    ).toBeUndefined()
  })

  it('clones finance data without sharing array item references', () => {
    const clone = cloneFinanceData(data)
    clone.categories[0].label = 'Changed'

    expect(data.categories[0].label).toBe('Income')
  })

  it('creates and parses backup files with metadata', () => {
    const backup = createFinanceBackup(data, '2026-06-09T10:00:00.000Z')

    expect(backup).toEqual({
      app: FINANCE_BACKUP_APP,
      version: FINANCE_BACKUP_VERSION,
      exportedAt: '2026-06-09T10:00:00.000Z',
      data,
    })
    expect(parseFinanceBackup(backup)).toEqual(data)
  })

  it('rejects malformed backup files', () => {
    const backup = createFinanceBackup(data)

    expect(parseFinanceBackup({ ...backup, app: 'other-app' })).toBeUndefined()
    expect(parseFinanceBackup({ ...backup, version: 999 })).toBeUndefined()
    expect(parseFinanceBackup({ ...backup, data: { ...data, accounts: 'bad' } })).toBeUndefined()
  })
})

describe('financeRepo transaction queries', () => {
  it('extracts month keys and available months', () => {
    expect(transactionMonthKey('2026-06-12')).toBe('2026-06')
    expect(availableTransactionMonths(data)).toEqual(['2026-06', '2026-05'])
  })

  it('filters transactions by month, category, account and type', () => {
    const result = listTransactions(data, {
      month: '2026-06',
      categoryId: 'food',
      accountId: 'savings',
      type: 'expense',
    })

    expect(result.map((t) => t.id)).toEqual(['t6'])
  })

  it('sorts and limits transactions', () => {
    expect(listTransactions(data, { sort: 'date-desc', limit: 3 }).map((t) => t.id)).toEqual([
      't7',
      't6',
      't5',
    ])
    expect(listTransactions(data, { sort: 'date-asc', limit: 2 }).map((t) => t.id)).toEqual([
      't1',
      't2',
    ])
  })

  it('searches transactions by description, category label and account name', () => {
    expect(listTransactions(data, { search: 'groceries' }).map((t) => t.id)).toEqual(['t5'])
    expect(listTransactions(data, { search: 'HOME' }).map((t) => t.id)).toEqual(['t2', 't4'])
    expect(listTransactions(data, { search: 'savings' }).map((t) => t.id)).toEqual(['t6'])
    expect(listTransactions(data, { search: 'cafe' }).map((t) => t.id)).toEqual(['t7'])
  })

  it('combines search with existing filters', () => {
    const result = listTransactions(data, {
      month: '2026-06',
      type: 'expense',
      search: 'rent',
    })

    expect(result.map((t) => t.id)).toEqual(['t4'])
  })

  it('sorts transactions by absolute amount', () => {
    expect(listTransactions(data, { sort: 'amount-desc', limit: 3 }).map((t) => t.id)).toEqual([
      't1',
      't3',
      't4',
    ])
    expect(listTransactions(data, { sort: 'amount-asc', limit: 2 }).map((t) => t.id)).toEqual([
      't6',
      't7',
    ])
  })
})
