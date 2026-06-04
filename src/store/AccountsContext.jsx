import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { genAccountId, loadAccounts, saveAccounts } from './accountsStorage.js'

const AccountsContext = createContext(null)

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(null)

  useEffect(() => {
    loadAccounts().then(setAccounts)
  }, [])

  // Commit: cập nhật state và lưu file ngay lập tức (fire-and-forget).
  const commit = useCallback((updater) => {
    setAccounts((prev) => {
      if (prev === null) return prev
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveAccounts(next)
      return next
    })
  }, [])

  const addAccount = useCallback(
    (name, role = 'guest', password = 'theb123') => {
      if (!name.trim()) return null
      const acc = {
        id: genAccountId(),
        name: name.trim(),
        password,
        role,
        createdAt: new Date().toISOString(),
      }
      commit((prev) => [...prev, acc])
      return acc
    },
    [commit],
  )

  const registerAccount = useCallback(
    (name, password) => {
      if (!name.trim() || !password) return null
      const acc = {
        id: genAccountId(),
        name: name.trim(),
        password,
        role: 'guest',
        createdAt: new Date().toISOString(),
      }
      commit((prev) => [...prev, acc])
      return acc
    },
    [commit],
  )

  const updateAccount = useCallback(
    (id, changes) => {
      commit((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)))
    },
    [commit],
  )

  const removeAccount = useCallback(
    (id) => {
      commit((prev) => prev.filter((a) => a.id !== id))
    },
    [commit],
  )

  const importAccounts = useCallback(
    (list) => {
      if (Array.isArray(list) && list.length > 0) commit(list)
    },
    [commit],
  )

  const isReady = accounts !== null

  return (
    <AccountsContext.Provider
      value={{
        accounts: accounts ?? [],
        isReady,
        addAccount,
        registerAccount,
        updateAccount,
        removeAccount,
        importAccounts,
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const ctx = useContext(AccountsContext)
  if (!ctx) throw new Error('useAccounts phải được dùng bên trong <AccountsProvider>')
  return ctx
}
