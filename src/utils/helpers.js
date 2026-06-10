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

// ── Passion score ─────────────────────────────────────────────────────────────
// Tính rankMap: playerId → thứ hạng (0 = cao nhất). Chỉ tính người ≥10 trận.
export function computeRankMap(matches, accounts) {
  const stats = {}
  for (const m of matches) {
    const winA = m.scoreA > m.scoreB
    const winB = m.scoreB > m.scoreA
    for (const id of m.teamA) {
      if (!stats[id]) stats[id] = { wins: 0, losses: 0 }
      if (winA) stats[id].wins++; else if (winB) stats[id].losses++
    }
    for (const id of m.teamB) {
      if (!stats[id]) stats[id] = { wins: 0, losses: 0 }
      if (winB) stats[id].wins++; else if (winA) stats[id].losses++
    }
  }
  const list = accounts
    .filter(acc => stats[acc.id] && (stats[acc.id].wins + stats[acc.id].losses) >= 10)
    .map(acc => {
      const s = stats[acc.id]
      const total = s.wins + s.losses
      return { id: acc.id, winRate: s.wins / total * 100, rp: s.wins * 10 + s.losses * 3, total }
    })
    .sort((a, b) =>
      b.winRate !== a.winRate ? b.winRate - a.winRate :
      b.rp !== a.rp ? b.rp - a.rp : b.total - a.total
    )
  const rankMap = {}
  list.forEach((r, i) => { rankMap[r.id] = i })
  return { rankMap, rankedCount: list.length }
}

// Tính độ nhiệt huyết cho từng người tham gia buổi đấu.
// Thang điểm: 150 = 100%. Win +10, Loss +5, Hòa +3.
// Thắng vs rank cao hơn: +5 bonus. Thua vs rank thấp hơn: -3 penalty.
export function computePassionScores(sessionMatches, allMatches, participantIds, accounts) {
  const { rankMap, rankedCount } = computeRankMap(allMatches, accounts)
  const UNRANKED = rankedCount

  return participantIds.map(playerId => {
    const myMatches = sessionMatches.filter(
      m => m.teamA.includes(playerId) || m.teamB.includes(playerId)
    )
    if (myMatches.length === 0) {
      return { id: playerId, score: 0, pct: 0, matchCount: 0, wins: 0, losses: 0 }
    }
    const myRank = rankMap[playerId] ?? UNRANKED
    let score = 0, wins = 0, losses = 0
    for (const m of myMatches) {
      const inA = m.teamA.includes(playerId)
      const won = inA ? m.scoreA > m.scoreB : m.scoreB > m.scoreA
      const lost = inA ? m.scoreB > m.scoreA : m.scoreA > m.scoreB
      const opponents = inA ? m.teamB : m.teamA
      const avgOppRank = opponents.reduce((s, id) => s + (rankMap[id] ?? UNRANKED), 0) / opponents.length
      const vsHigher = avgOppRank < myRank
      const vsLower = avgOppRank > myRank
      if (won) { wins++; score += 30; if (vsHigher) score += 15 }
      else if (lost) { losses++; score += 5; if (vsLower) score -= 5 }
      else { score += 3 }
    }
    score = Math.max(0, score)
    const pct = Math.min(100, Math.round(score / 150 * 100))
    return { id: playerId, score, pct, matchCount: myMatches.length, wins, losses }
  })
}

export function getPassionLevel(pct) {
  if (pct >= 100) return { icon: '⚡', label: 'Siêu Nhân',   color: '#f59e0b', bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }
  if (pct >= 90)  return { icon: '🌋', label: 'Bùng Cháy',  color: '#ef4444', bar: 'linear-gradient(90deg,#ef4444,#f97316)' }
  if (pct >= 70)  return { icon: '🔥', label: 'Nhiệt Huyết', color: '#f97316', bar: 'linear-gradient(90deg,#f97316,#fb923c)' }
  if (pct >= 50)  return { icon: '😊', label: 'Bình Thường', color: '#22c55e', bar: 'linear-gradient(90deg,#22c55e,#4ade80)' }
  return          { icon: '😴', label: 'Chưa Bật',   color: '#94a3b8', bar: '#94a3b8' }
}

// Tên buổi tập dựa trên ngày
const DAY_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const VIBES    = ['Lên Trình', 'Giao Lưu', 'Vui Vẻ', 'Thăng Hoa', 'Bùng Nổ']

export function getSessionTitle(openedAt) {
  const d = new Date(openedAt)
  return `Buổi Giao Hữu ${DAY_FULL[d.getDay()]} — ${VIBES[d.getDate() % VIBES.length]}!`
}
