import { describe, expect, it } from 'vitest'
import type { FinanceData } from '../types/finance'
import { recurringOccurrences } from './recurring'

const data: FinanceData = {
  accounts: [
    {
      id: 'checking',
      name: 'Checking',
      type: 'cash',
      icon: 'wallet',
      accent: 'indigo',
      openingBalance: 0,
    },
    {
      id: 'savings',
      name: 'Savings',
      type: 'savings',
      icon: 'piggy',
      accent: 'emerald',
      openingBalance: 0,
    },
  ],
  categories: [
    { id: 'income', label: 'Income', color: '#22c55e', icon: 'salary' },
    { id: 'home', label: 'Home', color: '#6366f1', icon: 'home' },
  ],
  transactions: [
    {
      id: 'tx-confirmed',
      date: '2026-02-28',
      amount: -800,
      description: 'Rent',
      accountId: 'checking',
      categoryId: 'home',
      recurringRuleId: 'rent',
      recurrenceMonth: '2026-02',
    },
  ],
  transfers: [],
  recurringRules: [
    {
      id: 'rent',
      type: 'expense',
      description: 'Rent',
      amount: 800,
      dayOfMonth: 31,
      accountId: 'checking',
      categoryId: 'home',
      startMonth: '2026-01',
      active: true,
      frequency: 'monthly',
    },
    {
      id: 'savings-transfer',
      type: 'transfer',
      description: 'Savings',
      amount: 200,
      dayOfMonth: 5,
      fromAccountId: 'checking',
      toAccountId: 'savings',
      startMonth: '2026-02',
      active: true,
      frequency: 'monthly',
    },
  ],
  recurringSkips: [{ id: 'skip-transfer', ruleId: 'savings-transfer', month: '2026-02' }],
  savingsGoals: [],
}

describe('recurringOccurrences', () => {
  it('marks confirmed and skipped occurrences for a month', () => {
    const occurrences = recurringOccurrences(data, '2026-02')

    expect(occurrences.find((item) => item.rule.id === 'rent')).toMatchObject({
      date: '2026-02-28',
      status: 'confirmed',
      activityId: 'tx-confirmed',
    })
    expect(occurrences.find((item) => item.rule.id === 'savings-transfer')).toMatchObject({
      status: 'skipped',
    })
  })

  it('returns pending occurrences when no activity or skip exists', () => {
    expect(recurringOccurrences(data, '2026-03').map((item) => item.status)).toEqual([
      'pending',
      'pending',
    ])
  })
})
