import { useState } from 'react'
import { useAccounts } from '../store/AccountsContext.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { IconPlus, IconPencil, IconTrash } from './Icons.jsx'

const ROLES = [
  { value: 'guest', label: 'Guest' },
  { value: 'admin', label: 'Admin' },
]

export default function AccountsPanel() {
  const { accounts, addAccount, updateAccount, removeAccount } = useAccounts()
  const { actions: storeActions } = useStore()
  const { isAdmin, currentUser, syncUser } = useAuth()

  const [name, setName] = useState('')
  const [role, setRole] = useState('guest')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('guest')

  const submit = (e) => {
    e.preventDefault()
    addAccount(name, role)
    setName('')
    setRole('guest')
  }

  const startEdit = (acc) => {
    setEditingId(acc.id)
    setEditName(acc.name)
    setEditRole(acc.role)
  }

  const saveEdit = (e) => {
    e.preventDefault()
    updateAccount(editingId, { name: editName.trim(), role: editRole })
    if (editingId === currentUser?.id) syncUser({ name: editName.trim(), role: editRole })
    setEditingId(null)
  }

  const resetPassword = (acc) => {
    if (confirm(`Đặt lại mật khẩu của "${acc.name}" về "theb123"?`)) {
      updateAccount(acc.id, { password: 'theb123' })
    }
  }

  const handleRemove = (acc) => {
    if (acc.id === currentUser?.id) {
      alert('Không thể xoá tài khoản đang đăng nhập.')
      return
    }
    if (confirm(`Xoá tài khoản "${acc.name}"?`)) {
      removeAccount(acc.id)
      storeActions.purgeParticipant(acc.id)
    }
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Thành viên</h2>
        <p className="muted">
          {isAdmin
            ? 'Quản lý tài khoản thành viên, phân quyền và đặt lại mật khẩu.'
            : 'Danh sách thành viên câu lạc bộ.'}
        </p>
      </div>

      {isAdmin && (
        <form className="add-account-form card" onSubmit={submit}>
          <h4 style={{ marginBottom: 14, fontSize: 14, color: 'var(--ink-soft)' }}>
            Thêm tài khoản mới
          </h4>
          <div className="add-account-row">
            <input
              className="input"
              placeholder="Họ tên thành viên…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="input"
              style={{ flex: 'none', width: 'auto' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit" disabled={!name.trim()}>
              <IconPlus size={16} /> Thêm
            </button>
          </div>
          <p className="muted small" style={{ marginTop: 8 }}>
            Mật khẩu mặc định: <code>theb123</code>
          </p>
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="empty-state">Chưa có tài khoản nào.</p>
      ) : (
        <ul className="player-list" style={{ marginTop: 16 }}>
          {accounts.map((acc, i) => (
            <li
              key={acc.id}
              className={`player-row ${acc.id === currentUser?.id ? 'player-row-self' : ''}`}
            >
              {isAdmin && editingId === acc.id ? (
                <form className="inline-form grow" onSubmit={saveEdit}>
                  <input
                    className="input"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <select
                    className="input"
                    style={{ flex: 'none', width: 'auto' }}
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <button className="btn btn-primary" type="submit">Lưu</button>
                  <button className="btn btn-outline" type="button" onClick={() => setEditingId(null)}>Huỷ</button>
                </form>
              ) : (
                <>
                  <span className="player-index">{i + 1}</span>
                  <span className="player-name">
                    {acc.name}
                    {acc.id === currentUser?.id && (
                      <span className="self-tag">Bạn</span>
                    )}
                  </span>
                  <span className={`role-tag ${acc.role === 'admin' ? 'role-admin' : 'role-guest'}`}>
                    {acc.role === 'admin' ? 'Admin' : 'Guest'}
                  </span>
                  {isAdmin && (
                    <div className="row-actions">
                      <button className="btn-link" onClick={() => startEdit(acc)}>
                        <IconPencil size={14} /> Sửa
                      </button>
                      <button className="btn-link" onClick={() => resetPassword(acc)}>
                        Reset PW
                      </button>
                      <button className="btn-link danger" onClick={() => handleRemove(acc)}>
                        <IconTrash size={14} /> Xoá
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
