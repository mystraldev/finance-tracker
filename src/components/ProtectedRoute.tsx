import type { ReactNode } from 'react'

import { Navigate } from 'react-router-dom'

import { useAuth } from '../store/authContext'

type ProtectedRouteProperties = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProperties) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="auth-loading">Cargando…</div>
  }
  if (!session) {
    return <Navigate replace to="/login" />
  }
  return <>{children}</>
}
