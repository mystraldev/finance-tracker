import { describe, expect, it } from 'vitest'
import { selectableIcons } from '../../../src/components/iconCatalog'

describe('selectableIcons', () => {
  it('exports a non-empty array', () => {
    expect(selectableIcons.length).toBeGreaterThan(0)
  })

  it('includes common icons', () => {
    expect(selectableIcons).toContain('home')
    expect(selectableIcons).toContain('cart')
  })
})
