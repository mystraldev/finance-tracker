import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../../src/store/ThemeProvider'
import Sidebar from '../../../src/components/Sidebar'

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
})
