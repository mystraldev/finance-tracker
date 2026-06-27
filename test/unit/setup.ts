import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 26+ defines an experimental global localStorage that shadows jsdom's.
// Re-expose the jsdom instance when that happens.
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: (() => {
      const store = new Map<string, string>()
      return {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => { store.set(key, value) },
        removeItem: (key: string) => { store.delete(key) },
        clear: () => store.clear(),
        get length() { return store.size },
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
