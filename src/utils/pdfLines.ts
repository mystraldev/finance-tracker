/**
 * Reconstructs reading-order text lines from positioned PDF text spans.
 *
 * PDF.js returns text fragments with (x, y) coordinates rather than lines.
 * Spans sharing roughly the same vertical position form a visual row; sorting
 * them by x and joining yields a line equivalent to what `pdftotext -layout`
 * produces, which the statement parser then consumes.
 */

export type TextSpan = {
  str: string
  /** Horizontal position (PDF user space). */
  x: number
  /** Vertical position (PDF user space; larger = higher on the page). */
  y: number
}

export function reconstructLines(spans: TextSpan[], yTolerance = 2): string[] {
  const rows: { y: number; spans: TextSpan[] }[] = []

  for (const span of spans) {
    if (span.str.trim() === '') continue
    const row = rows.find((candidate) => Math.abs(candidate.y - span.y) <= yTolerance)
    if (row) {
      row.spans.push(span)
    } else {
      rows.push({ y: span.y, spans: [span] })
    }
  }

  return rows
    .toSorted((a, b) => b.y - a.y)
    .map((row) =>
      row.spans
        .toSorted((a, b) => a.x - b.x)
        .map((span) => span.str)
        .join(' ')
        .replaceAll(/\s+/g, ' ')
        .trim(),
    )
}
