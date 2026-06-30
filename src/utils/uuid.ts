/**
 * UUID generation that also works in non-secure contexts.
 *
 * `crypto.randomUUID()` is only available in secure contexts (HTTPS or
 * localhost), so it is `undefined` when the app is served over plain HTTP on a
 * LAN IP. `crypto.getRandomValues()` works everywhere, so we derive a v4 UUID
 * from it as a fallback.
 */

function rfc4122Byte(index: number, byte: number): number {
  switch (index) {
    case 6: {
      return (byte & 0x0F) | 0x40 // version 4
    }
    case 8: {
      return (byte & 0x3F) | 0x80 // variant 10xx
    }
    default: {
      return byte
    }
  }
}

function toV4(bytes: Uint8Array): string {
  const hex: string[] = Array.from(bytes.entries(), ([index, byte]) => rfc4122Byte(index, byte).toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

/** Random RFC 4122 v4 UUID from `crypto.getRandomValues` (no secure context needed). */
export function uuidV4(): string {
  return toV4(crypto.getRandomValues(new Uint8Array(16)))
}

/** `crypto.randomUUID()` when available, else a v4 fallback. */
export function randomUUID(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : uuidV4()
}
