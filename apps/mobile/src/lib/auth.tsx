import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearToken, getToken, setToken } from './api-client'
import { DEMO_ACCOUNT } from './demo-account'

interface AuthUser {
  id: string
  email: string
  plan: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginDemo: () => Promise<void>
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const token = await getToken()
        if (!token) return
        const me = await api.me()
        setUser({
          id: me.id,
          email: me.email ?? '',
          plan: me.plan,
        })
      } catch {
        await clearToken()
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    await setToken(res.token)
    setUser(res.user)
  }, [])

  const loginDemo = useCallback(async () => {
    const res = await api.auth.login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)
    await setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const res = await api.auth.register(data)
      await setToken(res.token)
      setUser(res.user)
    },
    [],
  )

  const logout = useCallback(async () => {
    await clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginDemo,
      register,
      logout,
    }),
    [user, isLoading, login, loginDemo, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}