import { createContext, useContext, useMemo, useState } from 'react'

/** Shared committee login — same for everyone */
export const SHARED_LOGIN = {
  username: 'gokuldhara',
  password: 'ganapati2026',
}

const SESSION_KEY = 'gds_auth_session'

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  function login(username, password) {
    const userOk =
      String(username).trim().toLowerCase() === SHARED_LOGIN.username.toLowerCase()
    const passOk = String(password) === SHARED_LOGIN.password

    if (!userOk || !passOk) {
      return { ok: false, error: 'Invalid username or password.' }
    }

    const session = {
      username: SHARED_LOGIN.username,
      name: 'Committee Member',
      loggedInAt: new Date().toISOString(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
