export function fractionOf(value: number, total: number): number {
  return total === 0 ? 0 : value / total
}
