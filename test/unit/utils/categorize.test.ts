import type { Transaction } from '../../../src/types/finance'

import { describe, expect, it } from 'vitest'

import { categoryRulesFrom, normalizeDescription, sameDescriptionTransactions } from '../../../src/utils/categorize'

function tx(id: string, description: string, categoryId: string): Transaction {
  return { id, date: '2026-06-01', amount: -10, description, accountId: 'a', categoryId }
}

describe('categorize', () => {
  it('normalizeDescription trims and lowercases', () => {
    expect(normalizeDescription('  Mercadona  ')).toBe('mercadona')
  })

  it('finds other transactions with the same description and a different category', () => {
    const txs = [
      tx('1', 'Mercadona', 'food'),
      tx('2', 'mercadona', 'other'),
      tx('3', 'Mercadona', 'compras'),
      tx('4', 'Spotify', 'ocio'),
    ]
    const targets = sameDescriptionTransactions(txs, '1', 'Mercadona', 'compras')
    expect(targets.map((t) => t.id)).toEqual(['2'])
  })

  it('builds description -> category rules from existing transactions', () => {
    const rules = categoryRulesFrom([tx('1', 'Mercadona', 'compras'), tx('2', 'Spotify', 'ocio')])
    expect(rules.get('mercadona')).toBe('compras')
    expect(rules.get('spotify')).toBe('ocio')
  })
})
