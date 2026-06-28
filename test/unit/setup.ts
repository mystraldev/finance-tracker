import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Node 26+ defines an experimental global localStorage that shadows jsdom's.
// Re-expose the jsdom instance when that happens.
if (globalThis.localStorage === undefined) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: (() => {
      const store = new Map<string, string>()
      return {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value)
        },
        removeItem: (key: string) => {
          store.delete(key)
        },
        clear: () => store.clear(),
        get length() {
          return store.size
        },
        // eslint-disable-next-line unicorn/prefer-iterator-to-array -- conflicting with prefer-spread; Iterator.from() not available in jsdom
        key: (index: number) => [...store.keys()][index] ?? null,
      }
    })(),
    writable: false,
    configurable: true,
  })
}

// Unmount React trees and reset jsdom between tests.
afterEach(() => {
  cleanup()
})
