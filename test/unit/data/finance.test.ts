import { describe, expect, it } from 'vitest'
import { seed } from '../../../src/data/finance'

describe('seed data', () => {
  it('has accounts', () => {
    expect(seed.accounts.length).toBeGreaterThan(0)
  })

  it('has categories', () => {
    expect(seed.categories.length).toBeGreaterThan(0)
  })

  it('has transactions', () => {
    expect(seed.transactions.length).toBeGreaterThan(0)
  })

  it('has well-formed accounts', () => {
    for (const a of seed.accounts) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.type).toMatch(/^(cash|savings|investment)$/)
    }
  })

  it('has well-formed transactions', () => {
    for (const t of seed.transactions) {
      expect(t.id).toBeTruthy()
      expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
