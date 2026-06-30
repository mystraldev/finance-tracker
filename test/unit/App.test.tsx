import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from '../../src/App'
import { FinanceProvider } from '../../src/store/FinanceProvider'
import { ThemeProvider } from '../../src/store/ThemeProvider'

vi.mock('../../src/store/authContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'dev@example.com' },
    session: { user: { id: '1' } },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

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
