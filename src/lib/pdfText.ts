import type { TextSpan } from '../utils/pdfLines'

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
// eslint-disable-next-line import-x/default -- Vite resolves `?url` to the worker asset URL
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

import { reconstructLines } from '../utils/pdfLines'

GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Extracts a PDF's text as reading-order lines, entirely in the browser.
 * The file never leaves the device.
 */
export async function extractPdfLines(file: File): Promise<string[]> {
  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await getDocument({ data }).promise
  const lines: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const spans: TextSpan[] = []
    for (const item of content.items) {
      if ('str' in item) {
        spans.push({ str: item.str, x: item.transform[4], y: item.transform[5] })
      }
    }
    lines.push(...reconstructLines(spans))
  }

  return lines
}
