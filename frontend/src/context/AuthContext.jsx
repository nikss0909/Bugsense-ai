import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { api, TOKEN_KEY } from '../api/client.js'

const USER_KEY = 'bugsense_user'
const AuthContext = createContext(null)

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(token))

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setBootstrapping(false)
  }, [])

  const saveSession = useCallback((payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    setToken(payload.token)
    setUser(payload.user)
    setBootstrapping(false)
  }, [])

  useEffect(() => {
    let ignore = false
    if (!token) {
      return undefined
    }
    api
      .get('/users/me')
      .then(({ data }) => {
        if (!ignore) {
          localStorage.setItem(USER_KEY, JSON.stringify(data))
          setUser(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          clearSession()
        }
      })
      .finally(() => {
        if (!ignore) {
          setBootstrapping(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [clearSession, token])

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      saveSession(data)
      return data
    },
    [saveSession],
  )

  const signup = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/signup', payload)
      saveSession(data)
      return data
    },
    [saveSession],
  )

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/users/me', payload)
    localStorage.setItem(USER_KEY, JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const value = useMemo(
    () => ({
      bootstrapping,
      isAuthenticated: Boolean(token),
      login,
      logout: clearSession,
      signup,
      token,
      updateProfile,
      user,
    }),
    [bootstrapping, clearSession, login, signup, token, updateProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
