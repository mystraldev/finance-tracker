import { describe, expect, it } from 'vitest'

import { parseRevolutStatement } from '../../../src/utils/statementParser'

// Lines as reconstructed from the PDF (token order preserved, single-spaced).
const lines = [
  'Cuenta personal (EUR)',
  '1 ene 2026 To Alba Rius Barrufet Otras -800,00€ 1.936,11€ 0,00€ 0,00€ 0,00€',
  '1 ene 2026 Dinero añadido a través de BIZUM Recargar 400,00€ 2.336,11€ 0,00€ 0,00€ 0,00€',
  '2 ene 2026 La Casa De Les 3 Amfores Comercio -15,00€ 2.321,11€ 0,00€ 0,00€ 0,00€',
  'Cuenta personal (USD)',
  '3 ene 2026 A US merchant Comercio -10,00$ 50,00$ 0,00$ 0,00$ 0,00$',
  'Cuenta Conjunta (EUR)',
  '5 ene 2026 Mercadona Comercio -30,00€ 200,00€ 0,00€ 0,00€ 0,00€',
  'Ahorros (EUR)',
  '1/1/26 Interés neto pagado a Cuenta Remunerada 2.02% 2% 0,55€ 0,10€ 0,00€ 0,00 0,45€',
]

describe('parseRevolutStatement', () => {
  it('extracts EUR current accounts and skips other currencies and sections', () => {
    const { accounts } = parseRevolutStatement(lines)
    expect(accounts.map((a) => a.name)).toEqual(['Cuenta personal', 'Cuenta Conjunta'])
  })

  it('parses signed amounts, balances, dates and categories', () => {
    const [personal] = parseRevolutStatement(lines).accounts
    expect(personal.transactions).toHaveLength(3)
    expect(personal.transactions[0]).toEqual({
      date: '2026-01-01',
      description: 'To Alba Rius Barrufet',
      category: 'Otras',
      amount: -800,
      balance: 1936.11,
    })
    expect(personal.transactions[1].amount).toBe(400)
    expect(personal.transactions[1].category).toBe('Recargar')
  })

  it('derives the opening balance from the first row', () => {
    const [personal] = parseRevolutStatement(lines).accounts
    // 1936.11 balance after a -800 movement => 2736.11 before it
    expect(personal.openingBalance).toBeCloseTo(2736.11, 2)
  })

  it('parses thousands and decimals in the European format', () => {
    const [personal] = parseRevolutStatement(lines).accounts
    expect(personal.transactions[2].balance).toBeCloseTo(2321.11, 2)
  })

  it('ignores noise lines without throwing', () => {
    expect(parseRevolutStatement(['', 'random text', 'Página 3 de 72']).accounts).toEqual([])
  })

  it('captures savings and investment balances, skipping zero and current accounts', () => {
    const summary = [
      'Cuenta personal (EUR)',
      'Saldo de apertura 2.736,11€ Saldo de cierre 3.215,63€',
      'Ahorros (EUR)',
      'Saldo de apertura 10.025,33€ Saldo de cierre 11.017,37€ Saldo máximo 13.003,45€',
      'Investment Services Resúmenes',
      'Saldo de apertura 0,00€ Saldo de cierre 0,00€',
      'Saldo de apertura 1.183,52€ Saldo de cierre 835,24€',
      'Crypto Resúmenes',
      'Saldo de cierre 672,50€',
      'Fondos Monetarios Flexibles (EUR)',
      'Saldo de cierre 0,00€',
    ]
    expect(parseRevolutStatement(summary).balanceAccounts).toEqual([
      { name: 'Ahorros', type: 'savings', balance: 11_017.37 },
      { name: 'Inversiones', type: 'investment', balance: 835.24 },
      { name: 'Crypto', type: 'investment', balance: 672.5 },
    ])
  })
})
