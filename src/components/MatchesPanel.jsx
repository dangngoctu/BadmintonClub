import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { activeSession, courtName } from '../utils/helpers.js'
import MatchCard from './MatchCard.jsx'

const SLOTS_NEEDED = { '1v1': 1, '2v2': 2 }

function emptySlots() {
  return { a1: '', a2: '', b1: '', b2: '' }
}

export default function MatchesPanel() {
  const { data, actions } = useStore()
  const { accounts } = useAccounts()
  const { isAdmin, isLoggedIn } = useAuth()

  const openCourts = data.courts
    .map((c) => ({ court: c, session: activeSession(data.sessions, c.id) }))
    .filter((x) => x.session)

  const [format, setFormat] = useState('2v2')
  const [courtId, setCourtId] = useState(openCourts[0]?.court.id || '')
  const [slots, setSlots] = useState(emptySlots)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')

  const selected = openCourts.find((x) => x.court.id === courtId) || openCourts[0] || null
  const session = selected?.session || null

  const participants = useMemo(() => {
    if (!session) return []
    return accounts.filter((a) => session.participantIds.includes(a.id))
  }, [session, accounts])

  const n = SLOTS_NEEDED[format]
  const needed = n * 2

  const activeSlotKeys = format === '1v1' ? ['a1', 'b1'] : ['a1', 'a2', 'b1', 'b2']
  const chosen = activeSlotKeys.map((k) => slots[k]).filter(Boolean)
  const allFilled = chosen.length === needed
  const distinctOk = new Set(chosen).size === needed
  const scoresEntered = scoreA !== '' && scoreB !== ''
  const canSave = Boolean(session) && allFilled && distinctOk && scoresEntered

  const optionsFor = (key) =>
    participants.filter((p) => p.id === slots[key] || !chosen.includes(p.id))

  const setSlot = (key, val) => setSlots((s) => ({ ...s, [key]: val }))

  const changeFormat = (f) => {
    setFormat(f)
    setSlots(emptySlots())
    setScoreA('')
    setScoreB('')
  }

  const reset = () => {
    setSlots(emptySlots())
    setScoreA('')
    setScoreB('')
  }

  const save = () => {
    if (!canSave) return
    actions.addMatch({
      format,
      sessionId: session.id,
      courtId: session.courtId,
      teamA: format === '1v1' ? [slots.a1] : [slots.a1, slots.a2],
      teamB: format === '1v1' ? [slots.b1] : [slots.b1, slots.b2],
      scoreA,
      scoreB,
    })
    reset()
  }

  const recentMatches = [...data.matches].sort(
    (a, b) => new Date(b.playedAt) - new Date(a.playedAt),
  )

  return (
    <section>
      <div className="panel-head">
        <h2>Trận đấu</h2>
        <p className="muted">
          {'Chọn thể thức, sân đang mở và người thi đấu rồi lưu kết quả.'}
        </p>
      </div>

      {isLoggedIn && (
        openCourts.length === 0 ? (
          <p className="empty-state">
            Chưa có sân nào đang mở. Mở một sân ở tab "Quản lý sân" để tạo trận.
          </p>
        ) : (
          <div className="card match-form">

            <div className="form-row-top">
              <div className="field" style={{ flex: 'none' }}>
                <label>Thể thức</label>
                <div className="format-toggle">
                  {['1v1', '2v2'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`format-btn ${format === f ? 'active' : ''}`}
                      onClick={() => changeFormat(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label>Sân thi đấu</label>
                <select
                  className="input"
                  value={selected?.court.id}
                  onChange={(e) => { setCourtId(e.target.value); reset() }}
                >
                  {openCourts.map((x) => (
                    <option key={x.court.id} value={x.court.id}>
                      {x.court.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {participants.length < needed ? (
              <p className="hint">
                Cần ít nhất <b>{needed} người</b> đã đăng ký ở{' '}
                <b>{courtName(data.courts, selected?.court.id)}</b> để tạo trận {format}.
                Hiện có {participants.length}. Đăng ký thêm ở tab "Quản lý sân".
              </p>
            ) : (
              <>
                <div className="teams">
                  <div className="team team-a">
                    <h4>{format === '1v1' ? 'Người A' : 'Đội A'}</h4>
                    <SlotSelect
                      label="Người chơi 1"
                      value={slots.a1}
                      options={optionsFor('a1')}
                      onChange={(v) => setSlot('a1', v)}
                    />
                    {format === '2v2' && (
                      <SlotSelect
                        label="Người chơi 2"
                        value={slots.a2}
                        options={optionsFor('a2')}
                        onChange={(v) => setSlot('a2', v)}
                      />
                    )}
                    <div className="field">
                      <label>Điểm</label>
                      <input
                        className="input score-input"
                        type="number"
                        min="0"
                        value={scoreA}
                        onChange={(e) => setScoreA(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="vs">VS</div>

                  <div className="team team-b">
                    <h4>{format === '1v1' ? 'Người B' : 'Đội B'}</h4>
                    <SlotSelect
                      label="Người chơi 1"
                      value={slots.b1}
                      options={optionsFor('b1')}
                      onChange={(v) => setSlot('b1', v)}
                    />
                    {format === '2v2' && (
                      <SlotSelect
                        label="Người chơi 2"
                        value={slots.b2}
                        options={optionsFor('b2')}
                        onChange={(v) => setSlot('b2', v)}
                      />
                    )}
                    <div className="field">
                      <label>Điểm</label>
                      <input
                        className="input score-input"
                        type="number"
                        min="0"
                        value={scoreB}
                        onChange={(e) => setScoreB(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {!distinctOk && chosen.length > 0 && (
                  <p className="hint hint-warn">Mỗi người chơi chỉ được chọn một lần.</p>
                )}

                {allFilled && distinctOk && !scoresEntered && (
                  <p className="hint hint-warn">Nhập điểm cho cả hai bên trước khi lưu.</p>
                )}

                <div className="form-actions">
                  <button className="btn btn-outline" onClick={reset}>Xoá lựa chọn</button>
                  <button className="btn btn-primary" onClick={save} disabled={!canSave}>
                    Lưu kết quả
                  </button>
                </div>
              </>
            )}
          </div>
        )
      )}

      <div className="panel-head" style={{ marginTop: isLoggedIn ? 28 : 0 }}>
        <h3>Lịch sử trận đấu ({recentMatches.length})</h3>
      </div>
      {recentMatches.length === 0 ? (
        <p className="empty-state">Chưa có trận đấu nào được ghi lại.</p>
      ) : (
        <div className="match-list">
          {recentMatches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              courts={data.courts}
              onRemove={isAdmin ? () => actions.removeMatch(m.id) : null}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function SlotSelect({ label, value, options, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Chọn —</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}
