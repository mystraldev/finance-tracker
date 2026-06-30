import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ErrorBoundary from '../../../src/components/ErrorBoundary'

function Boom() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>contenido</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('renders a recoverable fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {
      // swallow the expected React error log
    })
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText(/Algo ha ido mal/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Recargar/ })).toBeInTheDocument()
  })
})
