import type { TextSpan } from '../../../src/utils/pdfLines'

import { describe, expect, it } from 'vitest'

import { reconstructLines } from '../../../src/utils/pdfLines'

describe('reconstructLines', () => {
  it('groups spans by row, orders by x and joins them', () => {
    const spans: TextSpan[] = [
      { str: 'To Alba', x: 120, y: 700 },
      { str: '1 ene 2026', x: 40, y: 700 },
      { str: '-800,00', x: 300, y: 700.5 },
      { str: '€', x: 360, y: 700 },
    ]
    expect(reconstructLines(spans)).toEqual(['1 ene 2026 To Alba -800,00 €'])
  })

  it('orders rows from top to bottom of the page', () => {
    const spans: TextSpan[] = [
      { str: 'bottom', x: 0, y: 100 },
      { str: 'top', x: 0, y: 800 },
      { str: 'middle', x: 0, y: 450 },
    ]
    expect(reconstructLines(spans)).toEqual(['top', 'middle', 'bottom'])
  })

  it('collapses repeated whitespace and drops empty spans', () => {
    const spans: TextSpan[] = [
      { str: ' '.repeat(3), x: 10, y: 500 },
      { str: 'a', x: 20, y: 500 },
      { str: 'b', x: 40, y: 500 },
    ]
    expect(reconstructLines(spans)).toEqual(['a b'])
  })
})
