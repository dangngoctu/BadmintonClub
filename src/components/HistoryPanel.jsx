import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import {
  courtName,
  formatDuration,
  playerName,
  getPlayerAnimal,
  getPlayerColor,
  computePassionScores,
  getPassionLevel,
} from '../utils/helpers.js'
import MatchCard from './MatchCard.jsx'
import { IconX } from './Icons.jsx'

const MONTH_NAMES = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
]
const DAY_HEADERS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function HistoryPanel() {
  const { data } = useStore()
  const { accounts } = useAccounts()
  const [selected, setSelected] = useState(null)
  const today = new Date()

  // Khởi tạo về tháng có buổi gần nhất, hoặc tháng hiện tại nếu chưa có
  const initDate = useMemo(() => {
    if (data.sessions.length === 0) return today
    return new Date(
      data.sessions.reduce((a, b) =>
        new Date(a.openedAt) > new Date(b.openedAt) ? a : b,
      ).openedAt,
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [year, setYear] = useState(initDate.getFullYear())
  const [month, setMonth] = useState(initDate.getMonth())

  const totalParticipations = data.sessions.reduce(
    (sum, s) => sum + s.participantIds.length, 0,
  )

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  // Nhóm sessions theo ngày (key: YYYY-MM-DD)
  const sessionsByDate = useMemo(() => {
    const map = {}
    for (const s of data.sessions) {
      const key = toDateKey(new Date(s.openedAt))
      if (!map[key]) map[key] = []
      map[key].push(s)
    }
    return map
  }, [data.sessions])

  // Xây lưới 42 ô (6 tuần × 7 ngày)
  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const start = new Date(first)
    start.setDate(1 - first.getDay()) // lùi về Chủ nhật đầu tuần
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [year, month])

  const todayKey = toDateKey(today)

  return (
    <section>
      <div className="panel-head">
        <h2>Lịch sử mở sân</h2>
        <p className="muted">Nhấn vào buổi tổ chức để xem chi tiết các trận đã đấu.</p>
      </div>

      {/* Stat boxes */}
      <div className="stat-row">
        <StatBox value={data.sessions.length} label="Lượt mở sân" />
        <StatBox value={data.matches.length} label="Trận đã đấu" />
        <StatBox value={totalParticipations} label="Lượt tham gia" />
        <StatBox value={accounts.length} label="Người chơi" />
      </div>

      {/* Calendar */}
      <div className="cal-wrap">
        {/* Navigation */}
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth} title="Tháng trước">‹</button>
          <span className="cal-nav-title">{MONTH_NAMES[month]}, {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth} title="Tháng sau">›</button>
          <button className="cal-nav-today" onClick={goToday}>Hôm nay</button>
        </div>

        {/* Day headers */}
        <div className="cal-grid">
          {DAY_HEADERS.map((d) => (
            <div key={d} className={`cal-day-header ${d === 'CN' ? 'cal-day-sun' : ''}`}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="cal-cells">
          {cells.map((d, i) => {
            const key = toDateKey(d)
            const isCurrentMonth = d.getMonth() === month
            const isToday = key === todayKey
            const isSunday = d.getDay() === 0
            const daySessions = sessionsByDate[key] ?? []

            return (
              <div
                key={i}
                className={[
                  'cal-cell',
                  !isCurrentMonth && 'cal-cell-other',
                  isToday && 'cal-cell-today',
                  isSunday && 'cal-cell-sun',
                ].filter(Boolean).join(' ')}
              >
                <span className={`cal-date-num ${isToday ? 'cal-date-today' : ''}`}>
                  {d.getDate()}
                </span>

                {daySessions.map((s) => {
                  const matchCount = data.matches.filter((m) => m.sessionId === s.id).length
                  return (
                    <button
                      key={s.id}
                      className={`cal-event ${s.status === 'active' ? 'cal-event-active' : 'cal-event-closed'}`}
                      onClick={() => setSelected(s)}
                      title={`${courtName(data.courts, s.courtId)} · ${matchCount} trận`}
                    >
                      <span className="cal-event-dot" />
                      <span className="cal-event-name">{courtName(data.courts, s.courtId)}</span>
                      {matchCount > 0 && (
                        <span className="cal-event-count">{matchCount}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>{/* end cal-cells */}
      </div>{/* end cal-wrap */}

      {selected && (
        <SessionModal
          session={selected}
          data={data}
          accounts={accounts}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}

function StatBox({ value, label }) {
  return (
    <div className="stat-box">
      <div className="stat-box-value">{value}</div>
      <div className="stat-box-label">{label}</div>
    </div>
  )
}

function PassionSection({ session, data, accounts }) {
  const sessionMatches = data.matches.filter((m) => m.sessionId === session.id)
  if (session.participantIds.length === 0 || sessionMatches.length === 0) return null

  const scores = computePassionScores(sessionMatches, data.matches, session.participantIds, accounts)
  const sorted = [...scores].sort((a, b) => b.pct - a.pct)

  return (
    <div className="modal-section">
      <div className="section-label">Độ nhiệt huyết trong buổi</div>
      <div className="passion-grid">
        {sorted.map((p) => {
          const level = getPassionLevel(p.pct)
          const color = getPlayerColor(p.id)
          return (
            <div key={p.id} className="passion-card" style={{ borderTop: `3px solid ${level.color}` }}>
              <div className="passion-player">
                <div className="passion-avatar" style={{ background: color + '22', color }}>
                  {getPlayerAnimal(p.id)}
                </div>
                <span className="passion-name">{playerName(accounts, p.id)}</span>
              </div>
              {p.matchCount === 0 ? (
                <span className="passion-no-match">Không có trận nào</span>
              ) : (
                <>
                  <div className="passion-bar-wrap">
                    <div className="passion-bar" style={{ width: `${p.pct}%`, background: level.bar }} />
                  </div>
                  <div className="passion-footer">
                    <span className="passion-pct" style={{ color: level.color }}>{p.pct}%</span>
                    <span className="passion-level" style={{ background: level.color + '20', color: level.color }}>
                      {level.icon} {level.label}
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SessionModal({ session, data, accounts, onClose }) {
  const isOpen = session.status === 'active'
  const matches = data.matches
    .filter((m) => m.sessionId === session.id)
    .sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt))

  const dateStr = new Date(session.openedAt).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{courtName(data.courts, session.courtId)}</h3>
            <span className="muted small">📅 {dateStr}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
              <span className="dot" />
              {isOpen ? 'Đang mở' : 'Đã đóng'}
            </span>
            <button className="icon-btn modal-close-btn" onClick={onClose} title="Đóng">
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="modal-section">
          <div className="modal-quick-stats">
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">👥</span>
              <span className="modal-quick-val">{session.participantIds.length}</span>
              <span className="modal-quick-lbl">Tham gia</span>
            </div>
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">🏸</span>
              <span className="modal-quick-val">{matches.length}</span>
              <span className="modal-quick-lbl">Trận đấu</span>
            </div>
            <div className="modal-quick-stat">
              <span className="modal-quick-icon">⏱️</span>
              <span className="modal-quick-val">{formatDuration(session.openedAt, session.closedAt)}</span>
              <span className="modal-quick-lbl">Thời lượng</span>
            </div>
          </div>
        </div>

        {session.participantIds.length > 0 && (
          <div className="modal-section">
            <div className="section-label">Người tham gia ({session.participantIds.length})</div>
            <div className="chip-list">
              {session.participantIds.map((id) => (
                <span
                  key={id}
                  className="chip chip-static"
                  style={{
                    background: getPlayerColor(id) + '18',
                    borderColor: getPlayerColor(id) + '55',
                    color: getPlayerColor(id),
                  }}
                >
                  {getPlayerAnimal(id)} {playerName(accounts, id)}
                </span>
              ))}
            </div>
          </div>
        )}

        <PassionSection session={session} data={data} accounts={accounts} />

        <div className="modal-section">
          <div className="section-label">Các trận đấu ({matches.length})</div>
          {matches.length === 0 ? (
            <p className="empty-state" style={{ padding: '20px 0', border: 'none' }}>
              Chưa có trận đấu nào trong phiên này.
            </p>
          ) : (
            <div className="match-list">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} courts={data.courts} onRemove={null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
