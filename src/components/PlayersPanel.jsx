import { useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { IconPlus, IconPencil, IconTrash } from './Icons.jsx'

export default function PlayersPanel() {
  const { data, actions } = useStore()
  const { isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    actions.addPlayer(name)
    setName('')
  }

  const startEdit = (player) => {
    setEditingId(player.id)
    setEditName(player.name)
  }

  const saveEdit = (e) => {
    e.preventDefault()
    actions.renamePlayer(editingId, editName)
    setEditingId(null)
    setEditName('')
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Người chơi</h2>
        <p className="muted">Danh sách người chơi dùng để đăng ký sân và lập đội thi đấu.</p>
      </div>

      {isAdmin && (
        <form className="inline-form" onSubmit={submit}>
          <input
            className="input"
            placeholder="Tên người chơi mới…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={!name.trim()}>
            <IconPlus size={16} /> Thêm
          </button>
        </form>
      )}

      {data.players.length === 0 ? (
        <p className="empty-state">Chưa có người chơi nào.</p>
      ) : (
        <ul className="player-list">
          {data.players.map((p, i) => (
            <li key={p.id} className="player-row">
              {isAdmin && editingId === p.id ? (
                <form className="inline-form grow" onSubmit={saveEdit}>
                  <input
                    className="input"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    Lưu
                  </button>
                  <button className="btn btn-outline" type="button" onClick={() => setEditingId(null)}>
                    Huỷ
                  </button>
                </form>
              ) : (
                <>
                  <span className="player-index">{i + 1}</span>
                  <span className="player-name">{p.name}</span>
                  {isAdmin && (
                    <div className="row-actions">
                      <button className="btn-link" onClick={() => startEdit(p)}>
                        <IconPencil size={15} /> Sửa
                      </button>
                      <button
                        className="btn-link danger"
                        onClick={() => {
                          if (confirm(`Xoá người chơi "${p.name}"?`)) actions.removePlayer(p.id)
                        }}
                      >
                        <IconTrash size={15} /> Xoá
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
