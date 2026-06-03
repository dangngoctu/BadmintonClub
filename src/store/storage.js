// Lớp truy cập localStorage + dữ liệu khởi tạo mặc định.

export const STORAGE_KEY = 'badminton-data-v1'

// Mô hình dữ liệu:
// {
//   courts:   [{ id, name }]
//   players:  [{ id, name, createdAt }]
//   sessions: [{ id, courtId, status: 'active'|'closed', openedAt, closedAt, participantIds: [] }]
//   matches:  [{ id, sessionId, courtId, teamA: [id,id], teamB: [id,id], scoreA, scoreB, playedAt }]
// }

export function defaultData() {
  return {
    courts: [
      { id: 'court-1', name: 'Sân 1' },
      { id: 'court-2', name: 'Sân 2' },
    ],
    players: [],
    sessions: [],
    matches: [],
  }
}

// Bảo đảm dữ liệu đọc lên luôn có đủ các khoá cần thiết.
function normalize(data) {
  const base = defaultData()
  if (!data || typeof data !== 'object') return base
  return {
    courts: Array.isArray(data.courts) && data.courts.length ? data.courts : base.courts,
    players: Array.isArray(data.players) ? data.players : [],
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    matches: Array.isArray(data.matches) ? data.matches : [],
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    return normalize(JSON.parse(raw))
  } catch (err) {
    console.warn('Không đọc được dữ liệu đã lưu, dùng mặc định.', err)
    return defaultData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Không lưu được dữ liệu vào localStorage.', err)
  }
}

export { normalize }
