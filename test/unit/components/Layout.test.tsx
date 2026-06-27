import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Layout from '../../../src/components/Layout'
import { ThemeProvider } from '../../../src/store/ThemeProvider'

function renderLayout() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<p>child</p>} path="/" />
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
