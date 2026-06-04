import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { activeSession, formatDateTime, formatDuration } from '../utils/helpers.js'
import { IconCheck, IconLock, IconUnlock } from './Icons.jsx'

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
    <div className={`card court-card ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="court-card-stripe" />
      <div className="court-card-body">
        <div className="court-card-top">
          <h3>{court.name}</h3>
          <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
            <span className="dot" />
            {isOpen ? 'Đang mở' : 'Đã đóng'}
          </span>
        </div>

        {isOpen ? (
          <>
            {/* Mini stat cards */}
            <div className="court-mini-stats">
              <div className="court-mini-stat">
                <span className="mini-stat-icon">⏰</span>
                <span className="mini-stat-value">{formatDateTime(session.openedAt).split(' ')[1] ?? formatDateTime(session.openedAt)}</span>
                <span className="mini-stat-label">Mở lúc</span>
              </div>
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
            </div>

            <Participants session={session} actions={actions} isLoggedIn={isLoggedIn} />

            {isAdmin && (
              <button
                className="btn btn-danger btn-block"
                onClick={() => actions.closeCourt(court.id)}
              >
                <IconLock size={16} /> Đóng sân &amp; lưu lịch sử
              </button>
            )}
          </>
        ) : (
          <>
            <p className="muted court-empty">
              {isAdmin ? 'Sân đang đóng. Mở sân để bắt đầu nhận đăng ký.' : 'Sân chưa mở.'}
            </p>
            {isAdmin && (
              <button
                className="btn btn-primary btn-block"
                onClick={() => actions.openCourt(court.id)}
              >
                <IconUnlock size={16} /> Mở sân
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function Participants({ session, actions, isLoggedIn }) {
  const { accounts } = useAccounts()
  const { currentUser, isAdmin } = useAuth()
  const joinedIds = new Set(session.participantIds)

  return (
    <div className="participants">
      <div className="participants-head">
        <h4>Đăng ký tham gia</h4>
        {accounts.length === 0 && (
          <span className="muted small">Chưa có thành viên — admin thêm ở tab "Thành viên".</span>
        )}
      </div>
      <div className="chip-list">
        {accounts.map((a) => {
          const joined = joinedIds.has(a.id)
          const isSelf = currentUser?.id === a.id
          const canToggle = isLoggedIn && (isAdmin || isSelf)
          return (
            <button
              key={a.id}
              className={`chip ${joined ? 'chip-on' : ''}`}
              disabled={!canToggle}
              onClick={() => actions.setParticipant(session.id, a.id, !joined)}
              title={
                !isLoggedIn
                  ? 'Đăng nhập để đăng ký tham gia'
                  : !canToggle
                  ? 'Bạn chỉ có thể đăng ký cho chính mình'
                  : joined
                  ? 'Bấm để bỏ đăng ký'
                  : 'Bấm để đăng ký tham gia'
              }
            >
              <span className="chip-avatar">
                {joined ? <IconCheck size={13} /> : initials(a.name)}
              </span>
              {a.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
