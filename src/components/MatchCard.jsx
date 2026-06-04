import { useAccounts } from '../store/AccountsContext.jsx'
import { courtName, formatDateTime, playerName } from '../utils/helpers.js'
import { IconX } from './Icons.jsx'

export default function MatchCard({ match, courts, onRemove }) {
  const { accounts } = useAccounts()
  const { teamA, teamB, scoreA, scoreB, format = '2v2' } = match
  const winA = scoreA > scoreB
  const winB = scoreB > scoreA
  const is1v1 = format === '1v1'

  return (
    <div className="card match-card">
      <div className="match-meta">
        <span className="tag">{courtName(courts, match.courtId)}</span>
        <span className={`format-badge format-${format}`}>{format.toUpperCase()}</span>
        <span className="muted small">{formatDateTime(match.playedAt)}</span>
        {onRemove && (
          <button className="icon-btn" title="Xoá trận" onClick={onRemove}>
            <IconX size={15} />
          </button>
        )}
      </div>

      <div className="match-body">
        <div className={`match-team ${winA ? 'is-winner' : ''}`}>
          <div className="team-tag">
            {is1v1 ? 'Người A' : 'Đội A'}
            {winA && <span className="win-tag">Thắng</span>}
          </div>
          <div className="team-players">
            {teamA.map((id) => (
              <span key={id}>{playerName(accounts, id)}</span>
            ))}
          </div>
        </div>

        <div className="match-score">
          <span className={winA ? 'win' : ''}>{scoreA}</span>
          <span className="score-sep">:</span>
          <span className={winB ? 'win' : ''}>{scoreB}</span>
        </div>

        <div className={`match-team align-right ${winB ? 'is-winner' : ''}`}>
          <div className="team-tag">
            {winB && <span className="win-tag">Thắng</span>}
            {is1v1 ? 'Người B' : 'Đội B'}
          </div>
          <div className="team-players">
            {teamB.map((id) => (
              <span key={id}>{playerName(accounts, id)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
