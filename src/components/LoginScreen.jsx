import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { IconShuttle, IconLock } from './Icons.jsx'

export default function LoginScreen() {
  const { data } = useStore()
  const { login } = useAuth()
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const account = data.accounts.find((a) => a.id === selectedId)
    if (!account) {
      setError('Vui lòng chọn tài khoản.')
      return
    }
    if (account.password !== password) {
      setError('Mật khẩu không đúng. Vui lòng thử lại.')
      return
    }
    login(account)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">
            <IconShuttle size={26} />
          </span>
          <div>
            <div className="login-brand-name">Câu lạc bộ cầu lông</div>
            <div className="login-brand-sub">Court Management</div>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-title">Đăng nhập</h2>
        <p className="login-sub">Chọn tên của bạn và nhập mật khẩu để tiếp tục.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Tài khoản</label>
            <select
              className="input"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setError('') }}
              autoFocus
            >
              <option value="">— Chọn tên của bạn —</option>
              {data.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.role === 'admin' ? ' (Admin)' : ''}
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

          {error && <p className="login-error">{error}</p>}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            style={{ marginTop: 4 }}
            disabled={!selectedId || !password}
          >
            <IconLock size={16} /> Đăng nhập
          </button>
        </form>

        <p className="login-hint">Mật khẩu mặc định: <code>theb123</code></p>
      </div>
    </div>
  )
}
