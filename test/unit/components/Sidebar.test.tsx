import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Sidebar from '../../../src/components/Sidebar'
import { ThemeProvider } from '../../../src/store/ThemeProvider'

vi.mock('../../../src/store/authContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'dev@example.com' },
    session: { user: { id: '1' } },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}))

function renderSidebar() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Sidebar', () => {
  it('renders the app name', () => {
    renderSidebar()
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderSidebar()
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders multiple buttons', () => {
    renderSidebar()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the theme toggle', () => {
    renderSidebar()
    expect(screen.getByText('Tema')).toBeInTheDocument()
  })

  it('shows the correct theme label in default mode', () => {
    renderSidebar()
    const toggle = screen.getByLabelText(/Tema actual:/)
    expect(toggle).toBeInTheDocument()
  })

  it('renders the investments nav item as disabled', () => {
    renderSidebar()
    const disabledButton = screen.getByText('Inversiones').closest('button')
    expect(disabledButton).toBeDisabled()
  })
})
