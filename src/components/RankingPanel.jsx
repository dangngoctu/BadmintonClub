import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'

const FILTERS = [
  { key: 'month', label: 'Tháng này' },
  { key: '3months', label: '3 tháng gần nhất' },
  { key: 'year', label: 'Năm nay' },
  { key: 'all', label: 'Tất cả' },
]

const MEDALS = ['🥇', '🥈', '🥉']

function getMood(winRate, totalMatch) {
  if (winRate >= 70) return { icon: '🔥', text: 'Phong độ rất tốt' }
  if (winRate >= 55) return { icon: '🚀', text: 'Đang thăng tiến' }
  if (totalMatch >= 20) return { icon: '⭐', text: 'Thành viên tích cực' }
  return { icon: '💪', text: 'Tiếp tục phát huy nhé' }
}

function filterByPeriod(matches, period) {
  if (period === 'all') return matches
  const now = new Date()
  return matches.filter((m) => {
    const d = new Date(m.playedAt)
    if (period === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }
    if (period === '3months') {
      const cutoff = new Date(now)
      cutoff.setMonth(cutoff.getMonth() - 3)
      return d >= cutoff
    }
    if (period === 'year') {
      return d.getFullYear() === now.getFullYear()
    }
    return true
  })
}

function computeRankings(matches, accounts) {
  const statsMap = {}

  for (const m of matches) {
    const { teamA, teamB, scoreA, scoreB } = m
    const winA = scoreA > scoreB
    const winB = scoreB > scoreA

    for (const id of teamA) {
      if (!statsMap[id]) statsMap[id] = { wins: 0, losses: 0 }
      if (winA) statsMap[id].wins++
      else if (winB) statsMap[id].losses++
    }
    for (const id of teamB) {
      if (!statsMap[id]) statsMap[id] = { wins: 0, losses: 0 }
      if (winB) statsMap[id].wins++
      else if (winA) statsMap[id].losses++
    }
  }

  const list = []
  for (const acc of accounts) {
    const s = statsMap[acc.id]
    if (!s) continue
    const total = s.wins + s.losses
    if (total < 10) continue
    const winRate = (s.wins / total) * 100
    const rankingPoint = s.wins * 10 + s.losses * 3
    list.push({ id: acc.id, name: acc.name, wins: s.wins, losses: s.losses, total, winRate, rankingPoint })
  }

  list.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate
    if (b.rankingPoint !== a.rankingPoint) return b.rankingPoint - a.rankingPoint
    return b.total - a.total
  })

  return list
}

export default function RankingPanel() {
  const { data } = useStore()
  const { accounts } = useAccounts()
  const { currentUser } = useAuth()
  const [period, setPeriod] = useState('all')

  const filtered = useMemo(() => filterByPeriod(data.matches, period), [data.matches, period])
  const ranked = useMemo(() => computeRankings(filtered, accounts), [filtered, accounts])

  const myEntry = currentUser ? ranked.find((r) => r.id === currentUser.id) : null
  const myRank = myEntry ? ranked.indexOf(myEntry) + 1 : null

  // Club stats — computed from all matches (not filtered) for total match count, filtered for rate
  const totalMatchAll = data.matches.length
  const avgWinRate = ranked.length > 0
    ? ranked.reduce((s, r) => s + r.winRate, 0) / ranked.length
    : null
  const mostActive = ranked.length > 0
    ? ranked.reduce((a, b) => (b.total > a.total ? b : a))
    : null

  const top3 = ranked.slice(0, 3)

  return (
    <section className="ranking-panel">
      <div className="panel-head">
        <h2>Bảng Xếp Hạng CLB</h2>
        <p className="muted">Xếp hạng thành viên có từ 10 trận trở lên. Cùng nhau tiến bộ!</p>
      </div>

      {/* Filters */}
      <div className="rank-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`rank-filter-btn ${period === f.key ? 'active' : ''}`}
            onClick={() => setPeriod(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Club Stats */}
      <div className="rank-club-stats">
        <div className="rank-stat-box">
          <div className="rank-stat-value">{accounts.length}</div>
          <div className="rank-stat-label">Tổng thành viên</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value">{filtered.length}</div>
          <div className="rank-stat-label">Tổng trận đấu</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value">
            {avgWinRate != null ? `${avgWinRate.toFixed(0)}%` : '—'}
          </div>
          <div className="rank-stat-label">Tỷ lệ thắng TB</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value rank-stat-name">
            {mostActive ? mostActive.name : '—'}
          </div>
          <div className="rank-stat-label">Nhiều trận nhất ({mostActive?.total ?? 0} trận)</div>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="empty-state">
          Chưa có thành viên nào đủ 10 trận trong kỳ này.<br />
          <span style={{ fontSize: 13, marginTop: 6, display: 'block' }}>Hãy thi đấu thêm để lên bảng xếp hạng! 🏸</span>
        </div>
      ) : (
        <>
          {/* My Rank Card */}
          {myEntry && (
            <div className="my-rank-card">
              <div className="my-rank-label">Vị trí hiện tại của bạn</div>
              <div className="my-rank-body">
                <div className="my-rank-pos">
                  <span className="my-rank-num">#{myRank}</span>
                  <span className="my-rank-name">{myEntry.name}</span>
                </div>
                <div className="my-rank-stats">
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.rankingPoint}</span>
                    <span className="my-rank-stat-key">Điểm Ranking</span>
                  </div>
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.winRate.toFixed(0)}%</span>
                    <span className="my-rank-stat-key">Tỷ lệ thắng</span>
                  </div>
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.total}</span>
                    <span className="my-rank-stat-key">Tổng trận</span>
                  </div>
                </div>
                <div className="rank-mood">
                  {(() => { const m = getMood(myEntry.winRate, myEntry.total); return `${m.icon} ${m.text}` })()}
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium */}
          {top3.length >= 1 && (
            <div className="rank-section-title">Top 3 nổi bật</div>
          )}
          {top3.length >= 1 && (
            <div className="rank-top3">
              {/* Sắp xếp podium: hạng 2 - hạng 1 - hạng 3 */}
              {[top3[1], top3[0], top3[2]].map((player, vi) => {
                if (!player) return null
                const realIdx = vi === 0 ? 1 : vi === 1 ? 0 : 2
                const isPrimary = realIdx === 0
                return (
                  <div key={player.id} className={`rank-top3-item rank-top3-pos${realIdx + 1}`}>
                    <div className="rank-top3-medal">{MEDALS[realIdx]}</div>
                    <div className="rank-top3-name">{player.name}</div>
                    <div className="rank-top3-rate">{player.winRate.toFixed(0)}%</div>
                    <div className="rank-top3-pts">{player.rankingPoint} điểm</div>
                    <div className="rank-mood rank-mood-sm">
                      {(() => { const m = getMood(player.winRate, player.total); return `${m.icon} ${m.text}` })()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="rank-section-title">Danh sách xếp hạng</div>
          <div className="rank-table-wrap">
            <table className="rank-table">
              <thead>
                <tr>
                  <th className="col-rank">Hạng</th>
                  <th className="col-name">Thành viên</th>
                  <th className="col-num">Thắng</th>
                  <th className="col-num">Thua</th>
                  <th className="col-num">Tổng</th>
                  <th className="col-rate">Tỷ lệ thắng</th>
                  <th className="col-pts">Điểm Ranking</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((player, idx) => {
                  const isMe = currentUser && player.id === currentUser.id
                  const mood = getMood(player.winRate, player.total)
                  return (
                    <tr key={player.id} className={`rank-row ${isMe ? 'rank-row-me' : ''}`}>
                      <td className="col-rank">
                        {idx < 3 ? (
                          <span className="rank-medal">{MEDALS[idx]}</span>
                        ) : (
                          <span className="rank-num">{idx + 1}</span>
                        )}
                      </td>
                      <td className="col-name">
                        <span className="rank-player-name">{player.name}</span>
                        {isMe && <span className="self-tag">Bạn</span>}
                        <span className="rank-mood-inline">{mood.icon}</span>
                      </td>
                      <td className="col-num rank-win">{player.wins}</td>
                      <td className="col-num rank-lose">{player.losses}</td>
                      <td className="col-num">{player.total}</td>
                      <td className="col-rate">
                        <div className="rank-rate-bar-wrap">
                          <div
                            className="rank-rate-bar"
                            style={{ width: `${player.winRate}%` }}
                          />
                          <span className="rank-rate-label">{player.winRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="col-pts">
                        <span className="rank-pts-badge">{player.rankingPoint}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
