import type { AuthContextValue } from './authContext'
import type { Session } from '@supabase/supabase-js'
import type { ReactNode } from 'react'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '../lib/supabase'
import { AuthContext } from './authContext'

type AuthProviderProperties = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProperties) {
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!isActive) return
      setSession(data.session ?? undefined)
      setLoading(false)
    }
    void loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? undefined)
    })

    return () => {
      isActive = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? undefined,
      session,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
