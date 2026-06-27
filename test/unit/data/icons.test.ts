import { describe, expect, it } from 'vitest'

import { registry } from '../../../src/data/icons'

describe('icon registry', () => {
  it('contains a known icon', () => {
    expect(registry.wallet).toBeDefined()
  })

  it('returns undefined for an unknown icon', () => {
    expect(registry.nonexistent).toBeUndefined()
  })
})
