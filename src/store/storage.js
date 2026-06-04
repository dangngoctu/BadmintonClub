const API = '/api/appdata'

export function defaultData() {
  return {
    courts: [
      { id: 'court-1', name: 'Sân 1' },
      { id: 'court-2', name: 'Sân 2' },
    ],
    sessions: [],
    matches: [],
    finance: {
      openingBalance: 0,
      entries: [],
    },
  }
}

function normalize(raw) {
  const base = defaultData()
  if (!raw || typeof raw !== 'object') return base
  const rawFin = raw.finance && typeof raw.finance === 'object' ? raw.finance : {}
  return {
    courts: Array.isArray(raw.courts) && raw.courts.length ? raw.courts : base.courts,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    matches: Array.isArray(raw.matches) ? raw.matches : [],
    finance: {
      openingBalance: typeof rawFin.openingBalance === 'number' ? rawFin.openingBalance : 0,
      entries: Array.isArray(rawFin.entries) ? rawFin.entries : [],
    },
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
