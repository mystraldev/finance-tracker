import { describe, expect, it } from 'vitest'

import { randomUUID, uuidV4 } from '../../../src/utils/uuid'

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('uuid', () => {
  it('uuidV4 produces a valid v4 UUID without crypto.randomUUID', () => {
    expect(uuidV4()).toMatch(V4)
  })

  it('uuidV4 produces unique values', () => {
    expect(uuidV4()).not.toBe(uuidV4())
  })

  it('randomUUID produces a 36-char UUID', () => {
    expect(randomUUID()).toMatch(/^[0-9a-f-]{36}$/)
  })
})
