import { describe, expect, it } from 'vitest'

import { budgetStatusLabel, budgetStatusRank } from '../../../src/components/budgetStatus'

describe('budgetStatusRank', () => {
  it('marks over as the worst status', () => {
    expect(budgetStatusRank.over).toBe(0)
  })

  it('marks warning as middle', () => {
    expect(budgetStatusRank.warning).toBe(1)
  })

  it('marks ok as the best status', () => {
    expect(budgetStatusRank.ok).toBe(2)
  })
})

describe('budgetStatusLabel', () => {
  it('has a label for every status', () => {
    expect(budgetStatusLabel.ok).toBe('OK')
    expect(budgetStatusLabel.warning).toBe('Al límite')
    expect(budgetStatusLabel.over).toBe('Superado')
  })
})
