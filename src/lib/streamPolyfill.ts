/**
 * Polyfill async iteration of `ReadableStream` for Safari < 17.4.
 *
 * pdf.js reads its worker's responses with `for await (… of readableStream)`,
 * which throws "undefined is not a function" on Safari versions that lack
 * `ReadableStream.prototype[Symbol.asyncIterator]`. Importing this module for
 * its side effect installs the missing iterator before pdf.js runs.
 */

type AsyncIterableStream = ReadableStream<unknown> & {
  [Symbol.asyncIterator]?: unknown
}

const streamPrototype = ReadableStream.prototype as AsyncIterableStream

if (typeof streamPrototype[Symbol.asyncIterator] !== 'function') {
  Object.defineProperty(streamPrototype, Symbol.asyncIterator, {
    configurable: true,
    writable: true,
    value: async function* asyncIterator(this: ReadableStream<unknown>) {
      // eslint-disable-next-line unicorn/no-this-outside-of-class -- iterator must read the stream instance
      const reader = this.getReader()
      try {
        let chunk = await reader.read()
        while (!chunk.done) {
          yield chunk.value
          chunk = await reader.read()
        }
      } finally {
        reader.releaseLock()
      }
    },
  })
}
