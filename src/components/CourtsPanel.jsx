import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import {
  activeSession,
  formatDateTime,
  getPlayerAnimal,
  getPlayerColor,
  getSessionTitle,
} from '../utils/helpers.js'
import { IconLock, IconUnlock } from './Icons.jsx'

export default function CourtsPanel() {
  const { data, actions } = useStore()
  const { isAdmin, isLoggedIn } = useAuth()

  return (
    <section>
      <div className="panel-head">
        <h2>Quản lý sân</h2>
        <p className="muted">
          {isAdmin
            ? 'Mở sân để cho đăng ký tham gia, đóng sân để lưu lại lịch sử.'
            : isLoggedIn
            ? 'Bấm vào tên của bạn để đăng ký tham gia sân đang mở.'
            : 'Đăng nhập để đăng ký tham gia sân.'}
        </p>
      </div>

      <div className="court-grid">
        {data.courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            data={data}
            actions={actions}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </section>
  )
}

function CourtCard({ court, data, actions, isAdmin, isLoggedIn }) {
  const session = activeSession(data.sessions, court.id)
  const isOpen = Boolean(session)
  const matchCount = session
    ? data.matches.filter((m) => m.sessionId === session.id).length
    : 0

  return (
    <div className={`court-card-new ${isOpen ? 'is-open' : 'is-closed'}`}>
      {isOpen ? (
        <OpenSession
          court={court}
          session={session}
          matchCount={matchCount}
          data={data}
          actions={actions}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <ClosedCard
          court={court}
          actions={actions}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}

function ClosedCard({ court, actions, isAdmin }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [picking, setPicking] = useState(false)
  const [date, setDate] = useState(todayStr)

  const handleOpen = () => {
    actions.openCourt(court.id, date)
    setPicking(false)
    setDate(todayStr)
  }

  return (
    <div className="closed-card-inner">
      <div className="closed-card-top">
        <span className="court-icon">🏸</span>
        <div>
          <div className="closed-card-name">{court.name}</div>
          <div className="closed-card-status">Chưa mở</div>
        </div>
        <span className="badge badge-closed">
          <span className="dot" />
          Đã đóng
        </span>
      </div>
      {isAdmin && (
        picking ? (
          <div className="open-court-form">
            <div className="field">
              <label>Ngày tổ chức</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                autoFocus
              />
            </div>
            <div className="open-court-actions">
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={!date}
                onClick={handleOpen}
              >
                <IconUnlock size={16} /> Xác nhận mở sân
              </button>
              <button className="btn btn-outline" onClick={() => setPicking(false)}>
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 16 }}
            onClick={() => setPicking(true)}
          >
            <IconUnlock size={16} /> Mở sân
          </button>
        )
      )}
    </div>
  )
}

function OpenSession({ court, session, matchCount, data, actions, isAdmin, isLoggedIn }) {
  const title = getSessionTitle(session.openedAt)
  const dateStr = new Date(session.openedAt).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <>
      {/* Header */}
      <div className="session-card-header">
        <span className="session-live-badge">
          <span className="session-live-dot" /> Hội viên đang hoạt động
        </span>
        <span className="session-match-pill">{matchCount} trận</span>
      </div>

      {/* Title */}
      <div className="session-card-title">{title}</div>
      <div className="session-card-date">📅 Buổi chơi: {dateStr}</div>

      {/* Mini stats */}
      <div className="court-mini-stats" style={{ marginTop: 16 }}>
        <div className="court-mini-stat">
          <span className="mini-stat-icon">👥</span>
          <span className="mini-stat-value">{session.participantIds.length}</span>
          <span className="mini-stat-label">Tham gia</span>
        </div>
        <div className="court-mini-stat">
          <span className="mini-stat-icon">🏸</span>
          <span className="mini-stat-value">{matchCount}</span>
          <span className="mini-stat-label">Trận đấu</span>
        </div>
        <div className="court-mini-stat">
          <span className="mini-stat-icon">⏱️</span>
          <span className="mini-stat-value">
            {formatDateTime(session.openedAt).split(' ')[1] ?? '—'}
          </span>
          <span className="mini-stat-label">Mở lúc</span>
        </div>
      </div>

      {/* Attendance chips */}
      <Participants
        session={session}
        actions={actions}
        isLoggedIn={isLoggedIn}
        data={data}
      />

      {/* Joined members detail list */}
      {session.participantIds.length > 0 && (
        <JoinedList
          session={session}
          data={data}
          actions={actions}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
        />
      )}

      {isAdmin && (
        <button
          className="btn btn-danger btn-block"
          style={{ marginTop: 16 }}
          onClick={() => actions.closeCourt(court.id)}
        >
          <IconLock size={16} /> Đóng sân &amp; lưu lịch sử
        </button>
      )}
    </>
  )
}

function Participants({ session, actions, isLoggedIn, data }) {
  const { accounts } = useAccounts()
  const { currentUser, isAdmin } = useAuth()
  const joinedIds = new Set(session.participantIds)

  return (
    <div className="participants" style={{ marginTop: 18 }}>
      <div className="participants-head">
        <h4>Điểm danh thành viên ra sân nhanh</h4>
      </div>
      <div className="chip-list">
        {accounts.map((a) => {
          const joined = joinedIds.has(a.id)
          const isSelf = currentUser?.id === a.id
          const canToggle = isLoggedIn && (isAdmin || isSelf)
          const color = getPlayerColor(a.id)
          const animal = getPlayerAnimal(a.id)

          return (
            <button
              key={a.id}
              className={`chip-player ${joined ? 'chip-player-on' : ''}`}
              style={joined ? { backgroundColor: color, borderColor: color } : {}}
              disabled={!canToggle}
              onClick={() => actions.setParticipant(session.id, a.id, !joined)}
              title={
                !isLoggedIn
                  ? 'Đăng nhập để đăng ký tham gia'
                  : !canToggle
                  ? 'Bạn chỉ có thể đăng ký cho chính mình'
                  : joined ? 'Bấm để bỏ đăng ký' : 'Bấm để đăng ký tham gia'
              }
            >
              <span className="chip-player-animal">{animal}</span>
              <span className="chip-player-name">{a.name}</span>
              {joined && <span className="chip-player-check">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function JoinedList({ session, data, actions, isAdmin, isLoggedIn }) {
  const { accounts } = useAccounts()
  const { currentUser, isAdmin: _isAdmin } = useAuth()
  const joined = accounts.filter((a) => session.participantIds.includes(a.id))

  if (joined.length === 0) return null

  return (
    <div className="joined-list">
      <div className="joined-list-head">
        <span className="joined-list-title">Danh sách ra sân hôm nay</span>
        <span className="joined-list-count">{joined.length} thành viên</span>
      </div>
      <div className="joined-list-items">
        {joined.map((a) => {
          const animal = getPlayerAnimal(a.id)
          const color  = getPlayerColor(a.id)
          const isSelf = currentUser?.id === a.id
          const canRemove = isLoggedIn && (_isAdmin || isSelf)
          return (
            <div key={a.id} className="joined-item">
              <span
                className="joined-item-avatar"
                style={{ backgroundColor: color + '22', color }}
              >
                {animal}
              </span>
              <span className="joined-item-name">{a.name}</span>
              {canRemove && (
                <button
                  className="btn-absent"
                  onClick={() => actions.setParticipant(session.id, a.id, false)}
                >
                  ✕ Vắng mặt
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
