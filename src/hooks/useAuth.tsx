import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { GUEST_VIEWER_LABEL, disableGuestMode, enableGuestMode, isGuestModeEnabled } from '@/lib/guest-session'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isGuestMode: boolean
  viewerLabel: string
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  enterGuestMode: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    setIsGuestMode(isGuestModeEnabled())

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    isGuestMode,
    viewerLabel: isGuestMode ? GUEST_VIEWER_LABEL : (session?.user?.email ?? '未知用户'),
    isLoading,
    async signIn(email, password) {
      if (!supabase) {
        throw new Error('当前未配置 Supabase 环境变量，请使用游客模式体验。')
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signUp(email, password) {
      if (!supabase) {
        throw new Error('当前未配置 Supabase 环境变量，请使用游客模式体验。')
      }
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
    enterGuestMode() {
      enableGuestMode()
      setIsGuestMode(true)
    },
    async signOut() {
      if (isGuestMode) {
        disableGuestMode()
        setIsGuestMode(false)
        return
      }

      if (!supabase) return

      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }), [isGuestMode, isLoading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
