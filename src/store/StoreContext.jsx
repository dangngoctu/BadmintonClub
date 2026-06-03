import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { defaultData, loadData, saveData, normalize } from './storage.js'

const StoreContext = createContext(null)

// Sinh id ngắn gọn, ổn định.
function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData)

  // Tự động lưu mỗi khi dữ liệu thay đổi.
  useEffect(() => {
    saveData(data)
  }, [data])

  const actions = useMemo(() => {
    // ---- Người chơi ----
    const addPlayer = (name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setData((d) => ({
        ...d,
        players: [...d.players, { id: uid(), name: trimmed, createdAt: new Date().toISOString() }],
      }))
    }

    const renamePlayer = (playerId, name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setData((d) => ({
        ...d,
        players: d.players.map((p) => (p.id === playerId ? { ...p, name: trimmed } : p)),
      }))
    }

    const removePlayer = (playerId) => {
      setData((d) => ({
        ...d,
        players: d.players.filter((p) => p.id !== playerId),
        // Gỡ khỏi danh sách tham gia của các phiên đang mở.
        sessions: d.sessions.map((s) =>
          s.status === 'active'
            ? { ...s, participantIds: s.participantIds.filter((id) => id !== playerId) }
            : s,
        ),
      }))
    }

    // ---- Sân / phiên mở sân ----
    const openCourt = (courtId) => {
      setData((d) => {
        const alreadyOpen = d.sessions.some((s) => s.courtId === courtId && s.status === 'active')
        if (alreadyOpen) return d
        const session = {
          id: uid(),
          courtId,
          status: 'active',
          openedAt: new Date().toISOString(),
          closedAt: null,
          participantIds: [],
        }
        return { ...d, sessions: [...d.sessions, session] }
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

    const setParticipant = (sessionId, playerId, joined) => {
      setData((d) => ({
        ...d,
        sessions: d.sessions.map((s) => {
          if (s.id !== sessionId) return s
          const has = s.participantIds.includes(playerId)
          if (joined && !has) return { ...s, participantIds: [...s.participantIds, playerId] }
          if (!joined && has)
            return { ...s, participantIds: s.participantIds.filter((id) => id !== playerId) }
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
      addPlayer,
      renamePlayer,
      removePlayer,
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
