import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { defaultData, loadData, saveData, normalize } from './storage.js'

const StoreContext = createContext(null)

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    loadData().then(setData)
  }, [])

  // Commit: cập nhật state và lưu file ngay lập tức (fire-and-forget).
  const set = (updater) => {
    setData((prev) => {
      if (prev === null) return prev
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveData(next)
      return next
    })
  }

  const actions = useMemo(() => {
    // ---- Sân / phiên mở sân ----
    const openCourt = (courtId) => {
      set((d) => {
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
      set((d) => ({
        ...d,
        sessions: d.sessions.map((s) =>
          s.courtId === courtId && s.status === 'active'
            ? { ...s, status: 'closed', closedAt: new Date().toISOString() }
            : s,
        ),
      }))
    }

    const setParticipant = (sessionId, accountId, joined) => {
      set((d) => ({
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

    // Dùng khi xoá account: dọn sạch khỏi các phiên đang mở.
    const purgeParticipant = (accountId) => {
      set((d) => ({
        ...d,
        sessions: d.sessions.map((s) =>
          s.status === 'active'
            ? { ...s, participantIds: s.participantIds.filter((id) => id !== accountId) }
            : s,
        ),
      }))
    }

    // ---- Trận đấu (1v1 hoặc 2v2) ----
    const addMatch = ({ sessionId, courtId, teamA, teamB, scoreA, scoreB, format }) => {
      set((d) => ({
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
      set((d) => ({ ...d, matches: d.matches.filter((m) => m.id !== matchId) }))
    }

    // ---- Thu chi ----
    const setOpeningBalance = (amount) => {
      set((d) => ({ ...d, finance: { ...d.finance, openingBalance: Number(amount) || 0 } }))
    }

    const addFinanceEntry = ({ date, type, purpose, amount, note }) => {
      set((d) => ({
        ...d,
        finance: {
          ...d.finance,
          entries: [
            ...d.finance.entries,
            { id: uid(), date, type, purpose, amount: Number(amount) || 0, note: note || '' },
          ],
        },
      }))
    }

    const updateFinanceEntry = (id, fields) => {
      set((d) => ({
        ...d,
        finance: {
          ...d.finance,
          entries: d.finance.entries.map((e) =>
            e.id === id ? { ...e, ...fields, amount: Number(fields.amount ?? e.amount) || 0 } : e,
          ),
        },
      }))
    }

    const removeFinanceEntry = (id) => {
      set((d) => ({
        ...d,
        finance: { ...d.finance, entries: d.finance.entries.filter((e) => e.id !== id) },
      }))
    }

    // ---- Xuất / Nhập / Xoá toàn bộ ----
    const importData = (incoming) => set(normalize(incoming))
    const resetData = () => set(defaultData())

    return {
      openCourt,
      closeCourt,
      setParticipant,
      purgeParticipant,
      addMatch,
      removeMatch,
      setOpeningBalance,
      addFinanceEntry,
      updateFinanceEntry,
      removeFinanceEntry,
      importData,
      resetData,
    }
  }, [])

  const isReady = data !== null
  const value = useMemo(() => ({ data: data ?? defaultData(), isReady, actions }), [data, isReady, actions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore phải được dùng bên trong <StoreProvider>')
  return ctx
}
