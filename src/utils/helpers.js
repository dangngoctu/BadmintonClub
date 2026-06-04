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

// ── Player identity ────────────────────────────────────────────────────────────
const ANIMALS = ['🐻', '🦊', '🐺', '🦁', '🐯', '🐼', '🦝', '🐸', '🦄', '🐧', '🦋', '🐮']
const PLAYER_COLORS = [
  '#22c55e', '#f59e0b', '#3b82f6', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#a855f7', '#14b8a6', '#6366f1',
]

function _hash(str) {
  return str.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0x7fffffff, 0)
}

export function getPlayerAnimal(id) {
  return ANIMALS[_hash(id) % ANIMALS.length]
}

export function getPlayerColor(id) {
  return PLAYER_COLORS[_hash(id) % PLAYER_COLORS.length]
}

// Kết quả 5 trận gần nhất của một người: ['W','L','W',...]
export function getFormGuide(matches, accountId, count = 5) {
  return [...matches]
    .filter((m) => m.teamA.includes(accountId) || m.teamB.includes(accountId))
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .slice(0, count)
    .map((m) => {
      const inA = m.teamA.includes(accountId)
      const won = inA ? m.scoreA > m.scoreB : m.scoreB > m.scoreA
      return won ? 'W' : 'L'
    })
}

// Tên buổi tập dựa trên ngày
const DAY_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const VIBES    = ['Lên Trình', 'Giao Lưu', 'Vui Vẻ', 'Thăng Hoa', 'Bùng Nổ']

export function getSessionTitle(openedAt) {
  const d = new Date(openedAt)
  return `Buổi Giao Hữu ${DAY_FULL[d.getDay()]} — ${VIBES[d.getDate() % VIBES.length]}!`
}
