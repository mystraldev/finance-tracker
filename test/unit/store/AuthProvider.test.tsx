import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../../../src/store/authContext'
import { AuthProvider } from '../../../src/store/AuthProvider'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getSession.mockResolvedValue({ data: { session: null } })
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mocks.unsubscribe } },
  })
  mocks.signInWithPassword.mockResolvedValue({ error: null })
  mocks.signUp.mockResolvedValue({ error: null })
  mocks.signOut.mockResolvedValue({ error: null })
})

describe('AuthProvider', () => {
  it('resolves the initial session and stops loading', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeUndefined()
    expect(result.current.session).toBeUndefined()
  })

  it('exposes the user from an existing session', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: '1', email: 'dev@example.com' } } },
    })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user?.email).toBe('dev@example.com')
  })

  it('signs in with email and password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.signIn('dev@example.com', 'secret1')
    })
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'dev@example.com',
      password: 'secret1',
    })
  })

  it('signs up with email and password', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.signUp('new@example.com', 'secret1')
    })
    expect(mocks.signUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret1' })
  })

  it('signs out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.signOut()
    })
    expect(mocks.signOut).toHaveBeenCalled()
  })

  it('throws when sign in fails', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: new Error('Invalid login') })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await expect(result.current.signIn('x@y.com', 'bad')).rejects.toThrow('Invalid login')
  })
})
