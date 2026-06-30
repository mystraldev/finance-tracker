import type { ErrorInfo, ReactNode } from 'react'

import { Component } from 'react'

type ErrorBoundaryProperties = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

/** Catches render errors anywhere below it and shows a recoverable fallback. */
export default class ErrorBoundary extends Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  state: ErrorBoundaryState = { hasError: false }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console -- surface render crashes while debugging
    console.error('[app] render error', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-status app-status--error">
          <p>Algo ha ido mal. Vuelve a cargar la página.</p>
          <button className="btn-primary" onClick={() => location.reload()} type="button">
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
