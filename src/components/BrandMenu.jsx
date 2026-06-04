import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { IconShuttle } from './Icons.jsx'

export default function BrandMenu() {
  const { data, actions } = useStore()
  const { currentUser, isAdmin, isLoggedIn, login, logout, syncUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="brand-menu">
      <button className="brand-btn" onClick={() => setOpen((o) => !o)}>
        <span className="brand-mark">
          <IconShuttle size={22} />
        </span>
        <div className="brand-text">
          {isLoggedIn ? (
            <>
              <span className="brand-name">{currentUser.name}</span>
              <div className="brand-sub">
                <span className={`brand-role-badge ${isAdmin ? 'is-admin' : ''}`}>
                  {isAdmin ? 'Admin' : 'Guest'}
                </span>
                {' '}▾
              </div>
            </>
          ) : (
            <>
              <span className="brand-name">Câu lạc bộ cầu lông</span>
              <div className="brand-sub">Đăng nhập ▾</div>
            </>
          )}
        </div>
      </button>

      {open && (
        <>
          <div className="popover-backdrop" onClick={close} />
          <div className="brand-popover">
            {isLoggedIn ? (
              <LoggedInMenu
                currentUser={currentUser}
                isAdmin={isAdmin}
                onUpdate={() => { close(); setShowUpdate(true) }}
                onLogout={() => { close(); logout() }}
              />
            ) : (
              <LoginForm data={data} login={login} onDone={close} />
            )}
          </div>
        </>
      )}

      {showUpdate && (
        <UpdateModal
          currentUser={currentUser}
          data={data}
          actions={actions}
          syncUser={syncUser}
          onClose={() => setShowUpdate(false)}
        />
      )}
    </div>
  )
}

function LoginForm({ data, login, onDone }) {
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const account = data.accounts.find((a) => a.id === selectedId)
    if (!account) { setError('Vui lòng chọn tài khoản.'); return }
    if (account.password !== password) { setError('Mật khẩu không đúng.'); return }
    login(account)
    onDone()
  }

  return (
    <div className="popover-body">
      <div className="popover-title">Đăng nhập</div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Tài khoản</label>
          <select
            className="input"
            value={selectedId}
            autoFocus
            onChange={(e) => { setSelectedId(e.target.value); setError('') }}
          >
            <option value="">— Chọn tên của bạn —</option>
            {data.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}{a.role === 'admin' ? ' (Admin)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Mật khẩu</label>
          <input
            className="input"
            type="password"
            placeholder="Nhập mật khẩu…"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
          />
        </div>
        {error && <p className="popover-error">{error}</p>}
        <button
          className="btn btn-primary btn-block"
          type="submit"
          style={{ marginTop: 4 }}
          disabled={!selectedId || !password}
        >
          Đăng nhập
        </button>
      </form>
      <p className="popover-hint">Mật khẩu mặc định: <code>theb123</code></p>
    </div>
  )
}

function LoggedInMenu({ currentUser, isAdmin, onUpdate, onLogout }) {
  return (
    <div className="popover-menu">
      <div className="popover-user-info">
        <div>
          <div className="popover-user-name">{currentUser.name}</div>
          <div className="popover-user-role">{isAdmin ? 'Admin' : 'Guest'}</div>
        </div>
      </div>
      <button className="popover-menu-item" onClick={onUpdate}>
        Cập nhật thông tin
      </button>
      <button className="popover-menu-item popover-menu-danger" onClick={onLogout}>
        Đăng xuất
      </button>
    </div>
  )
}

function UpdateModal({ currentUser, data, actions, syncUser, onClose }) {
  const account = data.accounts.find((a) => a.id === currentUser.id)
  const [name, setName] = useState(currentUser.name)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  if (!account) { onClose(); return null }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Tên không được để trống.'); return }
    if (account.password !== currentPw) { setError('Mật khẩu hiện tại không đúng.'); return }

    const changes = { name: name.trim() }
    if (newPw.trim()) changes.password = newPw.trim()

    actions.updateAccount(currentUser.id, changes)
    syncUser({ name: name.trim() })
    setSaved(true)
    setTimeout(onClose, 900)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Cập nhật thông tin</h3>
          <button className="icon-btn modal-close-btn" onClick={onClose} title="Đóng">
            <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
          </button>
        </div>
        <div className="modal-section">
          {saved ? (
            <p style={{ color: 'var(--green-700)', fontWeight: 600, padding: '8px 0' }}>
              ✓ Đã lưu thay đổi.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Tên hiển thị</label>
                <input
                  className="input"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Mật khẩu hiện tại</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Xác nhận bằng mật khẩu hiện tại…"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setError('') }}
                />
              </div>
              <div className="field">
                <label>
                  Mật khẩu mới
                  <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>
                    (để trống nếu không đổi)
                  </span>
                </label>
                <input
                  className="input"
                  type="password"
                  placeholder="Mật khẩu mới…"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              {error && <p className="login-error" style={{ marginBottom: 12 }}>{error}</p>}
              <div className="form-actions">
                <button className="btn btn-outline" type="button" onClick={onClose}>Huỷ</button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!name.trim() || !currentPw}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
