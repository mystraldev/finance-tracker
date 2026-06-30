import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LoginPage from '../../../src/pages/LoginPage'

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }))

vi.mock('../../../src/store/authContext', () => ({
  useAuth: () => ({
    user: undefined,
    session: undefined,
    loading: false,
    signIn: mocks.signIn,
    signUp: mocks.signUp,
    signOut: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.signIn.mockResolvedValue(undefined)
  mocks.signUp.mockResolvedValue(undefined)
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders the sign in form by default', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('toggles to the sign up form', () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /Crear una/ }))
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('calls signIn with the entered credentials', async () => {
    renderLogin()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dev@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledWith('dev@example.com', 'secret1'))
  })

  it('shows an error message when sign in fails', async () => {
    mocks.signIn.mockRejectedValue(new Error('Invalid login credentials'))
    renderLogin()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dev@example.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
  })
})
