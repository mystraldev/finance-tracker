export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0
}

export function isMonthKey(value: unknown): value is string {
  return isString(value) && /^\d{4}-\d{2}$/.test(value) && monthExists(value)
}

export function isISODate(value: unknown): value is string {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function daysInMonth(month: string): number {
  if (!isMonthKey(month)) return 31
  const [year, monthIndex] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
}

export function clampDayToMonth(month: string, day: number): number {
  return Math.min(Math.max(Math.trunc(day), 1), daysInMonth(month))
}

export function dateForMonthDay(month: string, day: number): string {
  const safeDay = clampDayToMonth(month, day)
  return `${month}-${String(safeDay).padStart(2, '0')}`
}

export function hasUniqueIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map((item) => item.id)).size === items.length
}

export function parseDecimalAmount(text: string): number | null {
  const normalised = text.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalised)) return null
  const value = Number(normalised)
  return Number.isFinite(value) ? value : null
}

export function parseSignedDecimalAmount(text: string): number | null {
  const normalised = text.trim().replace(',', '.')
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalised)) return null
  const value = Number(normalised)
  return Number.isFinite(value) ? value : null
}

export function monthProgress(month: string, now = new Date()): {
  elapsedRatio: number
  daysRemaining: number
} {
  const totalDays = daysInMonth(month)
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (month < currentMonth) return { elapsedRatio: 1, daysRemaining: 0 }
  if (month > currentMonth) return { elapsedRatio: 0, daysRemaining: totalDays }

  const today = Math.min(now.getDate(), totalDays)
  return {
    elapsedRatio: today / totalDays,
    daysRemaining: Math.max(totalDays - today, 0),
  }
}

function monthExists(value: string): boolean {
  const [, rawMonth] = value.split('-').map(Number)
  return rawMonth >= 1 && rawMonth <= 12
}
