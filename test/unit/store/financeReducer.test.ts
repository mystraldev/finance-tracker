import type { FinanceData } from '../../../src/types/finance'

import { describe, expect, it } from 'vitest'

import { createState, reducer } from '../../../src/store/financeReducer'

const twoMonths: FinanceData = {
  accounts: [],
  categories: [],
  transactions: [
    { id: 'a', date: '2026-05-10', amount: 1, description: '', accountId: 'x', categoryId: 'y' },
    { id: 'b', date: '2026-06-10', amount: 1, description: '', accountId: 'x', categoryId: 'y' },
  ],
  savingsGoals: [],
}

describe('financeReducer month selection', () => {
  it('SET_DATA keeps the month the user is viewing when it still has data', () => {
    let state = createState(twoMonths)
    state = reducer(state, { type: 'SET_MONTH', payload: '2026-05' })
    // A reload (SET_DATA) must not yank the user back to the latest month.
    state = reducer(state, { type: 'SET_DATA', payload: twoMonths })
    expect(state.selectedMonth).toBe('2026-05')
  })

  it('SET_DATA falls back to the latest month when the viewed month has no data', () => {
    const state = reducer(
      { ...createState(twoMonths), selectedMonth: '2020-01' },
      { type: 'SET_DATA', payload: twoMonths },
    )
    expect(state.selectedMonth).toBe('2026-06')
  })

  it('IMPORT_DATA resets to the latest month of the imported data', () => {
    let state = createState(twoMonths)
    state = reducer(state, { type: 'SET_MONTH', payload: '2026-05' })
    state = reducer(state, { type: 'IMPORT_DATA', payload: twoMonths })
    expect(state.selectedMonth).toBe('2026-06')
  })
})
