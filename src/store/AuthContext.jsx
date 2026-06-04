import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'badminton-session-v2'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = sessionStorage.getItem(SESSION_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })

  // Gọi sau khi đã xác thực mật khẩu ở phía component.
  const login = (user) => {
    const payload = { id: user.id, name: user.name, role: user.role }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    setCurrentUser(payload)
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
  }

  // Đồng bộ thông tin session khi tài khoản được cập nhật.
  const syncUser = (changes) => {
    if (!currentUser) return
    const updated = { ...currentUser, ...changes }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    setCurrentUser(updated)
  }

  const isAdmin = currentUser?.role === 'admin'
  const isLoggedIn = currentUser !== null

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoggedIn, login, logout, syncUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
