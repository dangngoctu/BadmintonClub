import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { getPlayerAnimal, getPlayerColor, getFormGuide } from '../utils/helpers.js'
import MatchCard from './MatchCard.jsx'
import { IconX } from './Icons.jsx'

const FILTERS = [
  { key: 'month', label: 'Tháng này' },
  { key: '3months', label: '3 tháng' },
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
    if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    if (period === '3months') { const c = new Date(now); c.setMonth(c.getMonth() - 3); return d >= c }
    if (period === 'year') return d.getFullYear() === now.getFullYear()
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
      if (winA) statsMap[id].wins++; else if (winB) statsMap[id].losses++
    }
    for (const id of teamB) {
      if (!statsMap[id]) statsMap[id] = { wins: 0, losses: 0 }
      if (winB) statsMap[id].wins++; else if (winA) statsMap[id].losses++
    }
  }
  const list = []
  for (const acc of accounts) {
    const s = statsMap[acc.id]
    if (!s) continue
    const total = s.wins + s.losses
    // if (total < 10) continue
    const winRate = (s.wins / total) * 100
    const rankingPoint = s.wins * 10 + s.losses * 3
    list.push({ id: acc.id, name: acc.name, wins: s.wins, losses: s.losses, total, winRate, rankingPoint })
  }
  list.sort((a, b) =>
    b.winRate !== a.winRate ? b.winRate - a.winRate :
      b.rankingPoint !== a.rankingPoint ? b.rankingPoint - a.rankingPoint :
        b.total - a.total
  )
  return list
}

export default function RankingPanel() {
  const { data } = useStore()
  const { accounts } = useAccounts()
  const { currentUser } = useAuth()
  const [period, setPeriod] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const filtered = useMemo(() => filterByPeriod(data.matches, period), [data.matches, period])
  const ranked = useMemo(() => computeRankings(filtered, accounts), [filtered, accounts])

  const myEntry = currentUser ? ranked.find((r) => r.id === currentUser.id) : null
  const myRank = myEntry ? ranked.indexOf(myEntry) + 1 : null

  // Award winners (computed from all matches for credibility)
  const allRanked = useMemo(() => computeRankings(data.matches, accounts), [data.matches, accounts])
  const awardWins = allRanked.reduce((a, b) => b.wins > a.wins ? b : a, allRanked[0] ?? null)
  const awardRate = allRanked.reduce((a, b) => b.winRate > a.winRate ? b : a, allRanked[0] ?? null)
  const awardActive = allRanked.reduce((a, b) => b.total > a.total ? b : a, allRanked[0] ?? null)

  // Club stats
  const avgWinRate = ranked.length > 0 ? ranked.reduce((s, r) => s + r.winRate, 0) / ranked.length : null

  return (
    <section className="ranking-panel">
      <div className="panel-head">
        <h2>🏆 Bảng Xếp Hạng CLB</h2>
        <p className="muted">Xếp hạng thành viên có từ 10 trận trở lên · Cùng nhau tiến bộ!</p>
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

      {/* Award cards */}
      {allRanked.length >= 1 && (
        <div className="rank-awards">
          <AwardCard
            icon="🏅"
            title="Vua Đập Cầu"
            subtitle="Thắng nhiều nhất"
            player={awardWins}
            stat={`${awardWins?.wins ?? 0} thắng`}
            color="#f59e0b"
          />
          <AwardCard
            icon="🔥"
            title="Bất Bại"
            subtitle="Tỷ lệ cao nhất"
            player={awardRate}
            stat={`${awardRate ? awardRate.winRate.toFixed(0) : 0}% win`}
            color="#22c55e"
          />
          <AwardCard
            icon="⭐"
            title="Chăm Chỉ"
            subtitle="Ra sân nhiều nhất"
            player={awardActive}
            stat={`${awardActive?.total ?? 0} trận`}
            color="#3b82f6"
          />
        </div>
      )}

      {/* Club stats */}
      <div className="rank-club-stats">
        <div className="rank-stat-box">
          <div className="rank-stat-value">{accounts.length}</div>
          <div className="rank-stat-label">Tổng thành viên</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value">{filtered.length}</div>
          <div className="rank-stat-label">Trận đấu</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value">
            {avgWinRate != null ? `${avgWinRate.toFixed(0)}%` : '—'}
          </div>
          <div className="rank-stat-label">Tỷ lệ thắng TB</div>
        </div>
        <div className="rank-stat-box">
          <div className="rank-stat-value rank-stat-name">{ranked.length}</div>
          <div className="rank-stat-label">Đủ điều kiện xếp hạng</div>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="empty-state">
          Chưa có thành viên nào đủ 10 trận trong kỳ này.<br />
          <span style={{ fontSize: 13, marginTop: 6, display: 'block' }}>
            Hãy thi đấu thêm để lên bảng xếp hạng! 🏸
          </span>
        </div>
      ) : (
        <>
          {/* My rank card */}
          {myEntry && (
            <div className="my-rank-card">
              <div className="my-rank-label">Vị trí hiện tại của bạn</div>
              <div className="my-rank-body">
                <div className="my-rank-pos">
                  <span className="my-rank-num">#{myRank}</span>
                  <div>
                    <span className="my-rank-animal">{getPlayerAnimal(myEntry.id)}</span>
                    <span className="my-rank-name">{myEntry.name}</span>
                  </div>
                </div>
                <div className="my-rank-stats">
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.rankingPoint}</span>
                    <span className="my-rank-stat-key">Điểm</span>
                  </div>
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.winRate.toFixed(0)}%</span>
                    <span className="my-rank-stat-key">Win rate</span>
                  </div>
                  <div className="my-rank-stat">
                    <span className="my-rank-stat-val">{myEntry.total}</span>
                    <span className="my-rank-stat-key">Trận</span>
                  </div>
                </div>
                <div className="rank-mood">
                  {(() => { const m = getMood(myEntry.winRate, myEntry.total); return `${m.icon} ${m.text}` })()}
                </div>
              </div>
            </div>
          )}

          {/* Top 3 podium */}
          {ranked.length >= 1 && (
            <>
              <div className="rank-section-title">Top 3 nổi bật</div>
              <div className="rank-top3">
                {[ranked[1], ranked[0], ranked[2]].map((player, vi) => {
                  if (!player) return null
                  const realIdx = vi === 0 ? 1 : vi === 1 ? 0 : 2
                  const color = getPlayerColor(player.id)
                  return (
                    <div key={player.id} className={`rank-top3-item rank-top3-pos${realIdx + 1}`}>
                      <div className="rank-top3-medal">{MEDALS[realIdx]}</div>
                      <div
                        className="rank-top3-avatar"
                        style={{ backgroundColor: color + '22', color }}
                      >
                        {getPlayerAnimal(player.id)}
                      </div>
                      <div className="rank-top3-name">
                        {player.name}
                        <span className="rank-mood rank-mood-sm">
                          {(() => { const m = getMood(player.winRate, player.total); return `${m.icon}` })()}
                        </span>
                      </div>
                      <div className="rank-top3-rate">{player.winRate.toFixed(0)}%</div>
                      <div className="rank-top3-pts">{player.rankingPoint} điểm</div>
                      {/* <div className="rank-mood rank-mood-sm">
                        {(() => { const m = getMood(player.winRate, player.total); return `${m.icon} ${m.text}` })()}
                      </div> */}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Full table */}
          <div className="rank-section-title">Bảng anh hùng CLB</div>
          <div className="rank-table-wrap">
            <table className="rank-table">
              <thead>
                <tr>
                  <th className="col-rank">Hạng</th>
                  <th>Thành viên</th>
                  <th className="col-num">Điểm</th>
                  <th className="col-num col-wins">Thắng</th>
                  <th className="col-num col-losses">Thua</th>
                  <th className="col-rate">Tỷ lệ</th>
                  <th className="col-form">Phong độ (5 trận)</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((player, idx) => {
                  const isMe = currentUser && player.id === currentUser.id
                  const mood = getMood(player.winRate, player.total)
                  const form = getFormGuide(filtered, player.id, 5)
                  const color = getPlayerColor(player.id)
                  return (
                    <tr
                      key={player.id}
                      className={`rank-row ${isMe ? 'rank-row-me' : ''}`}
                      onClick={() => setSelectedPlayer(player)}
                      title="Xem toàn bộ lịch sử thi đấu"
                    >
                      <td className="col-rank">
                        {idx < 3
                          ? <span className="rank-medal">{MEDALS[idx]}</span>
                          : <span className="rank-num">{String(idx + 1).padStart(2, '0')}</span>
                        }
                      </td>
                      <td>
                        <div className="rank-player-cell">
                          <span
                            className="rank-player-avatar"
                            style={{ backgroundColor: color + '20', color }}
                          >
                            {getPlayerAnimal(player.id)}
                          </span>
                          <div>
                            <div className="rank-player-name">
                              {player.name}
                              {isMe && <span className="self-tag">Bạn</span>}
                            </div>
                            <div className="rank-player-sub">{mood.icon} {mood.text}</div>
                          </div>
                        </div>
                      </td>
                      <td className="col-num">
                        <span className="rank-pts-badge">{player.rankingPoint}</span>
                      </td>
                      <td className="col-num col-wins rank-win">{player.wins}</td>
                      <td className="col-num col-losses rank-lose">{player.losses}</td>
                      <td className="col-rate">
                        <div className="rank-rate-bar-wrap">
                          <div className="rank-rate-bar" style={{ width: `${player.winRate}%` }} />
                          <span className="rank-rate-label">{player.winRate.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="col-form">
                        <div className="form-guide">
                          {form.length === 0
                            ? <span className="form-empty">—</span>
                            : form.map((r, i) => (
                              <span key={i} className={`form-badge form-${r}`}>{r}</span>
                            ))
                          }
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedPlayer && (
        <PlayerHistoryModal
          player={selectedPlayer}
          matches={data.matches}
          courts={data.courts}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </section>
  )
}

function PlayerHistoryModal({ player, matches, courts, onClose }) {
  const history = useMemo(() =>
    matches
      .filter((m) => m.teamA.includes(player.id) || m.teamB.includes(player.id))
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt)),
    [matches, player.id],
  )

  const wins = history.filter((m) => {
    const inA = m.teamA.includes(player.id)
    return inA ? m.scoreA > m.scoreB : m.scoreB > m.scoreA
  }).length
  const losses = history.length - wins
  const winRate = history.length > 0 ? (wins / history.length) * 100 : 0
  const color = getPlayerColor(player.id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="player-modal-title">
            <span
              className="rank-player-avatar player-modal-avatar"
              style={{ backgroundColor: color + '20', color }}
            >
              {getPlayerAnimal(player.id)}
            </span>
            <div>
              <h3>{player.name}</h3>
              <span className="muted small">Toàn bộ lịch sử thi đấu</span>
            </div>
          </div>
          <button className="icon-btn modal-close-btn" onClick={onClose} title="Đóng">
            <IconX size={18} />
          </button>
        </div>

        <div className="modal-section">
          <div className="modal-quick-stats">
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">🏸</span>
              <span className="modal-quick-val">{history.length}</span>
              <span className="modal-quick-lbl">Tổng trận</span>
            </div>
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">✅</span>
              <span className="modal-quick-val">{wins}</span>
              <span className="modal-quick-lbl">Thắng</span>
            </div>
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">❌</span>
              <span className="modal-quick-val">{losses}</span>
              <span className="modal-quick-lbl">Thua</span>
            </div>
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">📊</span>
              <span className="modal-quick-val">{winRate.toFixed(0)}%</span>
              <span className="modal-quick-lbl">Tỷ lệ thắng</span>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <div className="section-label">Các trận đã đấu ({history.length})</div>
          {history.length === 0 ? (
            <p className="empty-state" style={{ padding: '20px 0', border: 'none' }}>
              Chưa có trận đấu nào.
            </p>
          ) : (
            <div className="match-list">
              {history.map((m) => {
                const inA = m.teamA.includes(player.id)
                const won = inA ? m.scoreA > m.scoreB : m.scoreB > m.scoreA
                return (
                  <div key={m.id} className={`player-history-item ${won ? 'ph-won' : 'ph-lost'}`}>
                    <span className={`form-badge form-${won ? 'W' : 'L'} ph-result-badge`}>
                      {won ? 'W' : 'L'}
                    </span>
                    <MatchCard match={m} courts={courts} onRemove={null} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AwardCard({ icon, title, subtitle, player, stat, color }) {
  if (!player) return null
  return (
    <div className="rank-award-card">
      <div className="award-icon" style={{ color }}>{icon}</div>
      <div className="award-title">{title}</div>
      <div className="award-subtitle">{subtitle}</div>
      <div
        className="award-avatar"
        style={{ backgroundColor: getPlayerColor(player.id) + '22', color: getPlayerColor(player.id) }}
      >
        {getPlayerAnimal(player.id)}
      </div>
      <div className="award-name">{player.name}</div>
      <div className="award-stat" style={{ backgroundColor: color + '15', color }}>{stat}</div>
    </div>
  )
}
