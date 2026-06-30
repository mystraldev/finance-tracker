import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from '../../src/App'
import { ThemeProvider } from '../../src/store/ThemeProvider'

vi.mock('../../src/lib/pdfText', () => ({ extractPdfLines: vi.fn() }))

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

vi.mock('../../src/data/supabaseFinanceRepo', () => ({
  newId: () => 'generated-id',
  fetchFinanceData: vi.fn().mockResolvedValue({
    accounts: [],
    categories: [],
    transactions: [],
    savingsGoals: [],
  }),
  upsertAccount: vi.fn(),
  upsertCategory: vi.fn(),
  upsertTransaction: vi.fn(),
  upsertSavingsGoal: vi.fn(),
  deleteAccount: vi.fn(),
  deleteCategory: vi.fn(),
  deleteTransaction: vi.fn(),
  deleteSavingsGoal: vi.fn(),
  clearAllData: vi.fn(),
  replaceAllData: vi.fn(),
  remapFinanceData: (data: unknown) => data,
}))

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
}

describe('App', () => {
  it('renders the sidebar navigation once data is loaded', async () => {
    renderApp()
    expect(await screen.findByText('Finance Tracker')).toBeInTheDocument()
  })

  it('renders at least one navigation link', async () => {
    renderApp()
    await screen.findByText('Finance Tracker')
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })
})
