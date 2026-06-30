import type { FormEvent } from 'react'

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../store/authContext'

type Mode = 'signin' | 'signup'

function getSubmitLabel(mode: Mode, isPending: boolean): string {
  if (isPending) return 'Un momento…'
  return mode === 'signin' ? 'Entrar' : 'Crear cuenta'
}

export default function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const [isPending, setIsPending] = useState(false)

  if (!loading && session) {
    return <Navigate replace to="/" />
  }

  function toggleMode() {
    setMode((current) => (current === 'signin' ? 'signup' : 'signin'))
    setError(undefined)
    setNotice(undefined)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(undefined)
    setNotice(undefined)
    setIsPending(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/', { replace: true })
      } else {
        await signUp(email, password)
        setNotice(
          'Cuenta creada. Si la confirmación por email está activada, revisa tu correo; ' +
            'si no, ya puedes iniciar sesión.',
        )
        setMode('signin')
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Algo ha ido mal. Inténtalo de nuevo.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">€</span>
          <span className="auth__name">Finance Tracker</span>
        </div>

        <h1 className="auth__title">{mode === 'signin' ? 'Inicia sesión' : 'Crea tu cuenta'}</h1>
        <p className="auth__subtitle">
          {mode === 'signin' ? 'Accede a tus finanzas.' : 'Empieza a registrar tus finanzas.'}
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="auth-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="field__input"
              id="auth-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="auth-password">
              Contraseña
            </label>
            <input
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="field__input"
              id="auth-password"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="form__error" role="alert">
              {error}
            </p>
          ) : undefined}
          {notice ? (
            <p className="auth__notice" role="status">
              {notice}
            </p>
          ) : undefined}

          <button className="btn-primary auth__submit" disabled={isPending} type="submit">
            {getSubmitLabel(mode, isPending)}
          </button>
        </form>

        <button className="auth__switch" onClick={toggleMode} type="button">
          {mode === 'signin' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}
