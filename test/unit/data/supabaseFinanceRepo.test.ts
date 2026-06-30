import { describe, expect, it, vi } from 'vitest'

const datasets = vi.hoisted(() => {
  const transactions = Array.from({ length: 1500 }, (_, index) => ({
    id: String(index),
    date: '2026-01-01',
    amount: -1,
    description: 'x',
    account_id: 'a',
    category_id: 'c',
  }))
  return {
    transactions,
    accounts: [
      { id: 'a', name: 'A', type: 'cash', icon: 'wallet', accent: 'indigo', opening_balance: 0, interest_rate: null },
    ],
    categories: [{ id: 'c', label: 'C', icon: 'cart', color: '#000', budget: null, is_income: false }],
    savings_goals: [],
  } as Record<string, unknown[]>
})

vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        range: (start: number, end: number) =>
          Promise.resolve({ data: datasets[table].slice(start, end + 1), error: null }),
      }),
    }),
  },
}))

const { fetchFinanceData } = await import('../../../src/data/supabaseFinanceRepo')

describe('fetchFinanceData', () => {
  it('paginates past the 1000-row PostgREST limit', async () => {
    const data = await fetchFinanceData()
    expect(data.transactions).toHaveLength(1500)
    expect(data.accounts).toHaveLength(1)
  })

  it('maps snake_case columns to the app model', async () => {
    const data = await fetchFinanceData()
    expect(data.accounts[0]).toMatchObject({ name: 'A', type: 'cash', openingBalance: 0 })
    expect(data.transactions[0]).toMatchObject({ accountId: 'a', categoryId: 'c', amount: -1 })
  })
})
