import { useRef, useState } from 'react'
import { useStore } from './store/StoreContext.jsx'
import { useAuth } from './store/AuthContext.jsx'
import { activeSession } from './utils/helpers.js'
import CourtsPanel from './components/CourtsPanel.jsx'
import PlayersPanel from './components/PlayersPanel.jsx'
import MatchesPanel from './components/MatchesPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import {
  IconShuttle,
  IconCourt,
  IconUsers,
  IconTrophy,
  IconClock,
  IconDownload,
  IconUpload,
  IconTrash,
  IconLock,
  IconUnlock,
} from './components/Icons.jsx'

const TABS = [
  { id: 'courts', label: 'Quản lý sân', Icon: IconCourt },
  { id: 'players', label: 'Người chơi', Icon: IconUsers },
  { id: 'matches', label: 'Trận đấu', Icon: IconTrophy },
  { id: 'history', label: 'Lịch sử', Icon: IconClock },
]

export default function App() {
  const { data, actions } = useStore()
  const { isAdmin, login, logout } = useAuth()
  const [tab, setTab] = useState('courts')
  const fileInputRef = useRef(null)

  const openCount = data.courts.filter((c) => activeSession(data.sessions, c.id)).length

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `san-cau-long-${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        actions.importData(parsed)
        alert('Đã nhập dữ liệu thành công.')
      } catch {
        alert('File JSON không hợp lệ.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    if (confirm('Xoá toàn bộ dữ liệu và đưa về trạng thái ban đầu? Hành động này không thể hoàn tác.')) {
      actions.resetData()
    }
  }

  const handleAdminToggle = () => {
    if (isAdmin) {
      logout()
      return
    }
    const pw = prompt('Nhập mật khẩu quản trị:')
    if (pw === null) return
    if (!login(pw)) {
      alert('Mật khẩu không đúng.')
    }
  }

  const statusText =
    (openCount > 0 ? `${openCount} sân đang mở` : 'Tất cả sân đang đóng') +
    ` · ${data.players.length} người chơi`

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <IconShuttle size={22} />
            </span>
            <div>
              <span className="brand-name">Câu lạc bộ cầu lông</span>
              <div className="brand-sub">Court Management</div>
            </div>
          </div>

          <div className="topbar-right">
            {isAdmin && (
              <div className="topbar-actions">
                <button className="btn-topbar" onClick={handleExport} title="Tải dữ liệu về dạng file .json">
                  <IconDownload size={15} /> Xuất JSON
                </button>
                <button
                  className="btn-topbar"
                  onClick={() => fileInputRef.current?.click()}
                  title="Nạp dữ liệu từ file .json đã sao lưu"
                >
                  <IconUpload size={15} /> Nhập JSON
                </button>
                <button
                  className="btn-topbar danger"
                  onClick={handleReset}
                  title="Xoá toàn bộ dữ liệu"
                >
                  <IconTrash size={15} /> Xoá hết
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportFile}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            <button
              className={`btn-admin ${isAdmin ? 'is-admin' : ''}`}
              onClick={handleAdminToggle}
              title={isAdmin ? 'Đang ở chế độ quản trị — bấm để đăng xuất' : 'Đăng nhập quản trị'}
            >
              {isAdmin ? <IconUnlock size={16} /> : <IconLock size={16} />}
              {isAdmin ? 'Admin' : 'Guest'}
            </button>
          </div>
        </div>

        <nav className="tabs">
          <div className="tabs-inner">
            <div className="tabs-list">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={`tab ${tab === id ? 'tab-active' : ''}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
            <span className="tabs-status">{statusText}</span>
          </div>
        </nav>
      </header>

      <main className="content">
        <div className="content-inner">
          {tab === 'courts' && <CourtsPanel />}
          {tab === 'players' && <PlayersPanel />}
          {tab === 'matches' && <MatchesPanel />}
          {tab === 'history' && <HistoryPanel />}
        </div>
      </main>

      <footer className="footer">
        <div className="content-inner">
          {isAdmin
            ? <>Chế độ quản trị. Dùng <b>Xuất JSON</b> để sao lưu và <b>Nhập JSON</b> để khôi phục dữ liệu.</>
            : 'Bạn đang xem với quyền khách. Chỉ có thể đăng ký tham gia sân đang mở.'}
        </div>
      </footer>
    </div>
  )
}
