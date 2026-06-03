import { createContext, useCallback, useContext, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'badminton-admin-session'

function check(pw) {
  return pw === 'Tu0937348540'
}

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    // Giữ trạng thái admin qua reload trong phiên trình duyệt (sessionStorage).
    return sessionStorage.getItem(SESSION_KEY) === '1'
  })

  const login = useCallback((pw) => {
    if (!check(pw)) return false
    sessionStorage.setItem(SESSION_KEY, '1')
    setIsAdmin(true)
    return true
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
