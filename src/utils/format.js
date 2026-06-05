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

const groupDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

export function formatCurrency(value) {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value) {
  return compactCurrencyFormatter.format(value)
}

/** Recibe una fracción (0.23 => 23,0 %). */
export function formatPercent(fraction) {
  return percentFormatter.format(fraction)
}

/** Formatea con signo explícito, útil para movimientos (+/-). */
export function formatSignedCurrency(value) {
  const formatted = currencyFormatter.format(Math.abs(value))
  return value < 0 ? `-${formatted}` : `+${formatted}`
}

export function formatDate(isoDate) {
  return dateFormatter.format(new Date(isoDate))
}

/** 'Martes, 3 de junio' (con mayúscula inicial), para cabeceras de grupo. */
export function formatGroupDate(isoDate) {
  const text = groupDateFormatter.format(new Date(isoDate))
  return text.charAt(0).toUpperCase() + text.slice(1)
}
