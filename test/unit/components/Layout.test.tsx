import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../../../src/store/ThemeProvider'
import Layout from '../../../src/components/Layout'

function renderLayout() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<p>child</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Layout', () => {
  it('renders children inside the layout', () => {
    renderLayout()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('renders the sidebar', () => {
    renderLayout()
    expect(screen.getByText('Finance Tracker')).toBeInTheDocument()
  })
})
