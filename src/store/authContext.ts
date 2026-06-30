import type { Session, User } from '@supabase/supabase-js'

import { createContext, useContext } from 'react'

export type AuthContextValue = {
  user: User | undefined
  session: Session | undefined
  loading: boolean
  signIn: (_email: string, _password: string) => Promise<void>
  signUp: (_email: string, _password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
