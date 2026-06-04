// Lớp truy cập localStorage + dữ liệu khởi tạo mặc định.
//
// Mô hình dữ liệu v2:
// {
//   courts:   [{ id, name }]
//   accounts: [{ id, name, password, role: 'admin'|'guest', createdAt }]
//   sessions: [{ id, courtId, status: 'active'|'closed', openedAt, closedAt, participantIds: [] }]
//   matches:  [{ id, format, sessionId, courtId, teamA: [id], teamB: [id], scoreA, scoreB, playedAt }]
// }

export const STORAGE_KEY = 'badminton-data-v2'

export function defaultData() {
  return {
    courts: [
      { id: 'court-1', name: 'Sân 1' },
      { id: 'court-2', name: 'Sân 2' },
    ],
    accounts: [
      {
        id: 'acc-default-admin',
        name: 'Admin',
        password: 'theb123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: [],
    matches: [],
  }
}

function normalize(raw) {
  const base = defaultData()
  if (!raw || typeof raw !== 'object') return base

  // Migration: cũ dùng 'players', mới dùng 'accounts'
  let accounts
  if (Array.isArray(raw.accounts) && raw.accounts.length > 0) {
    accounts = raw.accounts
  } else if (Array.isArray(raw.players) && raw.players.length > 0) {
    accounts = raw.players.map((p) => ({
      id: p.id,
      name: p.name,
      password: 'theb123',
      role: 'guest',
      createdAt: p.createdAt || new Date().toISOString(),
    }))
  } else {
    accounts = base.accounts
  }

  return {
    courts: Array.isArray(raw.courts) && raw.courts.length ? raw.courts : base.courts,
    accounts,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    matches: Array.isArray(raw.matches) ? raw.matches : [],
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
