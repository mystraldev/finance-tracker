/**
 * Pure parser for Revolut consolidated PDF statements (Spanish locale).
 *
 * Input is the statement's text reconstructed into reading-order lines (one
 * visual row per string). Output is the EUR current accounts and their
 * transactions. No OCR and no network: the format is a fixed template, so a
 * handful of regexes extract every row deterministically, and the running
 * balance lets callers verify the result.
 *
 * Out of scope (MVP): USD/GBP accounts, and savings/interest, investment and
 * crypto sections (different table formats) — they simply don't match.
 */

export type ParsedTransaction = {
  /** ISO date `YYYY-MM-DD`. */
  date: string
  description: string
  /** Raw Revolut category (e.g. `Comercio`, `Recargar`). */
  category: string
  /** Signed amount in EUR (negative = money out). */
  amount: number
  /** Running account balance after the transaction. */
  balance: number
}

export type ParsedAccount = {
  /** Account name as printed, e.g. `Cuenta personal`. */
  name: string
  /** Balance before the first transaction (derived from the first row). */
  openingBalance: number
  transactions: ParsedTransaction[]
}

export type ParsedStatement = {
  accounts: ParsedAccount[]
}

const MONTHS: Record<string, string> = {
  ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
  jul: '07', ago: '08', sep: '09', sept: '09', oct: '10', nov: '11', dic: '12',
}

// `Cuenta personal (EUR)` — name, then a 3-letter currency in parentheses.
const ACCOUNT_HEADER = /^([^()]*)\(([A-Z]{3})\)\s*$/
// `1 ene 2026 <rest>` — leading day/month/year, then the rest of the row.
const DATE_PREFIX = /^(\d{1,2})\s+(\p{L}+)\.?\s+(\d{4})\s+(\S.*)$/u
// A signed money value followed by `€` (the symbol may be split off by pdf.js).
const MONEY = /(-?\d{1,3}(?:\.\d{3})*,\d{2})\s*€/g

function parseAmount(raw: string): number {
  return Number(raw.replaceAll('.', '').replace(',', '.'))
}

function toIsoDate(day: string, month: string, year: string): string | undefined {
  const monthNumber = MONTHS[month.toLowerCase()]
  if (!monthNumber) return undefined
  return `${year}-${monthNumber}-${day.padStart(2, '0')}`
}

function splitDescription(middle: string): { description: string; category: string } {
  const tokens = middle.trim().split(/\s+/)
  if (tokens.length < 2) {
    return { description: middle.trim(), category: 'Otras' }
  }
  const category = tokens.at(-1) ?? 'Otras'
  return { description: tokens.slice(0, -1).join(' '), category }
}

function parseRow(line: string): ParsedTransaction | undefined {
  const prefix = DATE_PREFIX.exec(line.trim())
  if (!prefix) return undefined
  const [, day, month, year, rest] = prefix
  const date = toIsoDate(day, month, year)
  if (!date) return undefined

  const monies: RegExpMatchArray[] = []
  for (const match of rest.matchAll(MONEY)) {
    monies.push(match)
    if (monies.length === 2) break
  }
  if (monies.length < 2) return undefined

  const { description, category } = splitDescription(rest.slice(0, monies[0].index))
  return {
    date,
    description,
    category,
    amount: parseAmount(monies[0][1]),
    balance: parseAmount(monies[1][1]),
  }
}

export function parseRevolutStatement(lines: string[]): ParsedStatement {
  const order: ParsedAccount[] = []
  const byName = new Map<string, ParsedAccount>()
  let currentName: string | undefined
  let isEurCurrentAccount = false

  for (const line of lines) {
    const header = ACCOUNT_HEADER.exec(line)
    if (header) {
      currentName = header[1].trim()
      // MVP: only EUR current accounts (named "Cuenta ...").
      isEurCurrentAccount = header[2] === 'EUR' && currentName.startsWith('Cuenta')
      continue
    }
    if (!isEurCurrentAccount || !currentName) continue

    const tx = parseRow(line)
    if (!tx) continue

    let account = byName.get(currentName)
    if (!account) {
      account = { name: currentName, openingBalance: tx.balance - tx.amount, transactions: [] }
      byName.set(currentName, account)
      order.push(account)
    }
    account.transactions.push(tx)
  }

  return { accounts: order }
}
