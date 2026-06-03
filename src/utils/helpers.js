// Hàm tiện ích dùng chung: định dạng thời gian và truy vấn dữ liệu.

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Khoảng thời gian giữa hai mốc, hiển thị dạng "1g 25p".
export function formatDuration(startIso, endIso) {
  if (!startIso) return '—'
  const start = new Date(startIso).getTime()
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  const mins = Math.max(0, Math.round((end - start) / 60000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}g ${m}p`
  return `${m}p`
}

export function playerName(players, id) {
  const p = players.find((x) => x.id === id)
  return p ? p.name : 'Không rõ'
}

export function courtName(courts, id) {
  const c = courts.find((x) => x.id === id)
  return c ? c.name : 'Không rõ'
}

// Phiên đang mở của một sân (nếu có).
export function activeSession(sessions, courtId) {
  return sessions.find((s) => s.courtId === courtId && s.status === 'active') || null
}
