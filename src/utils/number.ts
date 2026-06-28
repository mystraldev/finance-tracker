/** Parses a user-typed decimal in Spanish or plain format ("1.234,56",
 *  "1234,56", "12.5"). Dots in groups of three with no comma are treated
 *  as thousands separators. Returns NaN for invalid or ambiguous input. */
export function parseDecimal(text: string): number {
  const raw = text.trim()
  if (!raw) return NaN

  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')

  let normalised: string
  if (lastComma !== -1 && lastDot !== -1) {
    // Both separators present: the last one is the decimal separator.
    normalised =
      lastComma > lastDot ? raw.replaceAll('.', '').replace(',', '.') : raw.replaceAll(',', '')
  } else if (lastComma !== -1) {
    normalised = raw.replace(',', '.')
  } else if (lastDot !== -1 && /^-?\d{1,3}(?:\.\d{3})+$/.test(raw)) {
    normalised = raw.replaceAll('.', '')
  } else {
    normalised = raw
  }

  if (!/^-?\d+(?:\.\d+)?$/.test(normalised)) return NaN
  return Number(normalised)
}
