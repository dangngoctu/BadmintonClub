import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { defaultData, loadData, saveData, normalize } from './storage.js'

const StoreContext = createContext(null)

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const actions = useMemo(() => {
    // ---- Tài khoản thành viên ----
    const addAccount = (name, role = 'guest', password = 'theb123') => {
      const trimmed = name.trim()
      if (!trimmed) return
      setData((d) => ({
        ...d,
        accounts: [
          ...d.accounts,
          { id: uid(), name: trimmed, password, role, createdAt: new Date().toISOString() },
        ],
      }))
    }

    const updateAccount = (accountId, changes) => {
      setData((d) => ({
        ...d,
        accounts: d.accounts.map((a) =>
          a.id === accountId ? { ...a, ...changes } : a,
        ),
      }))
    }

    const removeAccount = (accountId) => {
      setData((d) => ({
        ...d,
        accounts: d.accounts.filter((a) => a.id !== accountId),
        sessions: d.sessions.map((s) =>
          s.status === 'active'
            ? { ...s, participantIds: s.participantIds.filter((id) => id !== accountId) }
            : s,
        ),
      }))
    }

    // ---- Sân / phiên mở sân ----
    const openCourt = (courtId) => {
      setData((d) => {
        const alreadyOpen = d.sessions.some((s) => s.courtId === courtId && s.status === 'active')
        if (alreadyOpen) return d
        return {
          ...d,
          sessions: [
            ...d.sessions,
            {
              id: uid(),
              courtId,
              status: 'active',
              openedAt: new Date().toISOString(),
              closedAt: null,
              participantIds: [],
            },
          ],
        }
      })
    }

    const closeCourt = (courtId) => {
      setData((d) => ({
        ...d,
        sessions: d.sessions.map((s) =>
          s.courtId === courtId && s.status === 'active'
            ? { ...s, status: 'closed', closedAt: new Date().toISOString() }
            : s,
        ),
      }))
    }

    const setParticipant = (sessionId, accountId, joined) => {
      setData((d) => ({
        ...d,
        sessions: d.sessions.map((s) => {
          if (s.id !== sessionId) return s
          const has = s.participantIds.includes(accountId)
          if (joined && !has) return { ...s, participantIds: [...s.participantIds, accountId] }
          if (!joined && has)
            return { ...s, participantIds: s.participantIds.filter((id) => id !== accountId) }
          return s
        }),
      }))
    }

    // ---- Trận đấu (1v1 hoặc 2v2) ----
    const addMatch = ({ sessionId, courtId, teamA, teamB, scoreA, scoreB, format }) => {
      setData((d) => ({
        ...d,
        matches: [
          ...d.matches,
          {
            id: uid(),
            format: format || '2v2',
            sessionId,
            courtId,
            teamA,
            teamB,
            scoreA: Number(scoreA) || 0,
            scoreB: Number(scoreB) || 0,
            playedAt: new Date().toISOString(),
          },
        ],
      }))
    }

    const removeMatch = (matchId) => {
      setData((d) => ({ ...d, matches: d.matches.filter((m) => m.id !== matchId) }))
    }

    // ---- Xuất / Nhập / Xoá toàn bộ ----
    const importData = (incoming) => setData(normalize(incoming))
    const resetData = () => setData(defaultData())

    return {
      addAccount,
      updateAccount,
      removeAccount,
      openCourt,
      closeCourt,
      setParticipant,
      addMatch,
      removeMatch,
      importData,
      resetData,
    }
  }, [])

  const value = useMemo(() => ({ data, actions }), [data, actions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore phải được dùng bên trong <StoreProvider>')
  return ctx
}
