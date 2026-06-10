const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const groupDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value)
}

export function formatPercent(fraction: number): string {
  return percentFormatter.format(fraction)
}

export function formatSignedCurrency(value: number): string {
  const formatted = currencyFormatter.format(Math.abs(value))
  return value < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}

export function formatFullDate(isoDate: string): string {
  return fullDateFormatter.format(new Date(isoDate))
}

export function formatGroupDate(isoDate: string): string {
  const text = groupDateFormatter.format(new Date(isoDate))
  return text.charAt(0).toUpperCase() + text.slice(1)
}
