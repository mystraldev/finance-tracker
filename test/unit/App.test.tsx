import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../../src/store/ThemeProvider'
import { FinanceProvider } from '../../src/store/FinanceProvider'
import App from '../../src/App'

function renderApp() {
  return render(
    <ThemeProvider>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </ThemeProvider>,
  )
}

describe('App', () => {
  it('renders the sidebar navigation', () => {
    renderApp()
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument()
  })

  it('renders at least one navigation link', () => {
    renderApp()
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })
})
