// Lớp truy cập API server (Vite middleware ghi vào data/appdata.json).
//
// Mô hình dữ liệu:
// {
//   courts:   [{ id, name }]
//   sessions: [{ id, courtId, status: 'active'|'closed', openedAt, closedAt, participantIds: [] }]
//   matches:  [{ id, format, sessionId, courtId, teamA: [id], teamB: [id], scoreA, scoreB, playedAt }]
// }

const API = '/api/appdata'

export function defaultData() {
  return {
    courts: [
      { id: 'court-1', name: 'Sân 1' },
      { id: 'court-2', name: 'Sân 2' },
    ],
    sessions: [],
    matches: [],
  }
}

function normalize(raw) {
  const base = defaultData()
  if (!raw || typeof raw !== 'object') return base
  return {
    courts: Array.isArray(raw.courts) && raw.courts.length ? raw.courts : base.courts,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    matches: Array.isArray(raw.matches) ? raw.matches : [],
  }
}

export async function loadData() {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(res.statusText)
    return normalize(await res.json())
  } catch (err) {
    console.error('Không tải được appdata:', err)
    return defaultData()
  }
}

export async function saveData(data) {
  try {
    await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (err) {
    console.error('Không lưu được appdata:', err)
  }
}

export { normalize }
