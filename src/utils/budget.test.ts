import { describe, expect, it } from 'vitest'
import { formatBudgetRemaining } from './budget'

const norm = (s: string) => s.replace(/\s/g, ' ')

describe('formatBudgetRemaining', () => {
  it('describes remaining budget', () => {
    expect(norm(formatBudgetRemaining(50))).toMatch(/^50,00 € restantes$/)
  })

  it('describes overspend as an amount above budget', () => {
    expect(norm(formatBudgetRemaining(-25))).toMatch(/^25,00 € por encima$/)
  })
})
