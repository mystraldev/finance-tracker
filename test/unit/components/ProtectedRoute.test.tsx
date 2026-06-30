import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProtectedRoute from '../../../src/components/ProtectedRoute'

const state = vi.hoisted(() => ({
  auth: { user: undefined, session: undefined, loading: false } as {
    user: { id: string } | undefined
    session: { user: { id: string } } | undefined
    loading: boolean
  },
}))

vi.mock('../../../src/store/authContext', () => ({
  useAuth: () => state.auth,
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<p>login page</p>} path="/login" />
        <Route
          element={
            <ProtectedRoute>
              <p>secret content</p>
            </ProtectedRoute>
          }
          path="/private"
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  state.auth = { user: undefined, session: undefined, loading: false }
})

describe('ProtectedRoute', () => {
  it('shows a loading state while resolving the session', () => {
    state.auth = { user: undefined, session: undefined, loading: true }
    renderAt('/private')
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('redirects to /login when there is no session', () => {
    renderAt('/private')
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    state.auth = { user: { id: '1' }, session: { user: { id: '1' } }, loading: false }
    renderAt('/private')
    expect(screen.getByText('secret content')).toBeInTheDocument()
  })
})
