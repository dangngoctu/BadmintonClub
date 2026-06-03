import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import {
  courtName,
  formatDateTime,
  formatDuration,
  playerName,
} from '../utils/helpers.js'
import MatchCard from './MatchCard.jsx'
import { IconX } from './Icons.jsx'

export default function HistoryPanel() {
  const { data } = useStore()
  const [selected, setSelected] = useState(null)

  const sessions = [...data.sessions].sort(
    (a, b) => new Date(b.openedAt) - new Date(a.openedAt),
  )

  const totalParticipations = data.sessions.reduce(
    (sum, s) => sum + s.participantIds.length,
    0,
  )

  return (
    <section>
      <div className="panel-head">
        <h2>Lịch sử mở sân</h2>
        <p className="muted">Nhấn vào một phiên để xem chi tiết các trận đã đấu.</p>
      </div>

      <div className="stat-row">
        <StatBox value={data.sessions.length} label="Lượt mở sân" />
        <StatBox value={data.matches.length} label="Trận đã đấu" />
        <StatBox value={totalParticipations} label="Lượt tham gia" />
        <StatBox value={data.players.length} label="Người chơi" />
      </div>

      {sessions.length === 0 ? (
        <p className="empty-state">Chưa có lịch sử. Mở một sân ở tab "Quản lý sân" để bắt đầu.</p>
      ) : (
        <div className="session-list">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              data={data}
              matchCount={data.matches.filter((m) => m.sessionId === s.id).length}
              onClick={() => setSelected(s)}
            />
          ))}
        </div>
      )}

      {selected && (
        <SessionModal
          session={selected}
          data={data}
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

function SessionCard({ session, data, matchCount, onClick }) {
  const isOpen = session.status === 'active'

  return (
    <button className="card session-card session-card-btn" onClick={onClick}>
      <div className="session-head">
        <div>
          <h3>{courtName(data.courts, session.courtId)}</h3>
          <span className="muted small">
            {formatDateTime(session.openedAt)}
            {session.closedAt ? ` → ${formatDateTime(session.closedAt)}` : ''}
          </span>
        </div>
        <div className="session-head-right">
          <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
            <span className="dot" />
            {isOpen ? 'Đang mở' : 'Đã đóng'}
          </span>
          {matchCount > 0 && (
            <span className="session-match-count">{matchCount} trận</span>
          )}
        </div>
      </div>

      <ul className="session-stats">
        <li>
          <span className="stat-label">Thời lượng</span>
          <span className="stat-value">{formatDuration(session.openedAt, session.closedAt)}</span>
        </li>
        <li>
          <span className="stat-label">Người tham gia</span>
          <span className="stat-value">{session.participantIds.length}</span>
        </li>
        <li>
          <span className="stat-label">Số trận</span>
          <span className="stat-value">{matchCount}</span>
        </li>
      </ul>

      {session.participantIds.length > 0 && (
        <div className="session-participants">
          <span className="stat-label">Người tham gia</span>
          <div className="chip-list" style={{ marginTop: 8 }}>
            {session.participantIds.map((id) => (
              <span key={id} className="chip chip-static">
                {playerName(data.players, id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  )
}

function SessionModal({ session, data, onClose }) {
  const isOpen = session.status === 'active'
  const matches = data.matches
    .filter((m) => m.sessionId === session.id)
    .sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{courtName(data.courts, session.courtId)}</h3>
            <span className="muted small">
              {formatDateTime(session.openedAt)}
              {session.closedAt ? ` → ${formatDateTime(session.closedAt)}` : ''}
              {' · '}
              {formatDuration(session.openedAt, session.closedAt)}
            </span>
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

        {session.participantIds.length > 0 && (
          <div className="modal-section">
            <div className="section-label">Người tham gia ({session.participantIds.length})</div>
            <div className="chip-list">
              {session.participantIds.map((id) => (
                <span key={id} className="chip chip-static">
                  {playerName(data.players, id)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="modal-section">
          <div className="section-label">Các trận đấu ({matches.length})</div>
          {matches.length === 0 ? (
            <p className="empty-state" style={{ padding: '20px 0', border: 'none' }}>
              Chưa có trận đấu nào trong phiên này.
            </p>
          ) : (
            <div className="match-list">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} data={data} onRemove={null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
