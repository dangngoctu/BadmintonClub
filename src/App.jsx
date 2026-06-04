import { useRef, useState } from 'react'
import { useStore } from './store/StoreContext.jsx'
import { useAuth } from './store/AuthContext.jsx'
import { activeSession } from './utils/helpers.js'
import CourtsPanel from './components/CourtsPanel.jsx'
import AccountsPanel from './components/AccountsPanel.jsx'
import MatchesPanel from './components/MatchesPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import LoginScreen from './components/LoginScreen.jsx'
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
} from './components/Icons.jsx'

const TABS = [
  { id: 'courts', label: 'Quản lý sân', Icon: IconCourt },
  { id: 'accounts', label: 'Thành viên', Icon: IconUsers },
  { id: 'matches', label: 'Trận đấu', Icon: IconTrophy },
  { id: 'history', label: 'Lịch sử', Icon: IconClock },
]

export default function App() {
  const { data, actions } = useStore()
  const { currentUser, isAdmin, isLoggedIn, logout } = useAuth()
  const [tab, setTab] = useState('courts')
  const fileInputRef = useRef(null)

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const openCount = data.courts.filter((c) => activeSession(data.sessions, c.id)).length

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `san-cau-long-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        actions.importData(JSON.parse(reader.result))
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
      logout()
    }
  }

  const roleBadge = isAdmin ? 'Admin' : 'Guest'
  const statusText = openCount > 0 ? `${openCount} sân đang mở` : 'Tất cả sân đang đóng'

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
                <button className="btn-topbar" onClick={handleExport}>
                  <IconDownload size={15} /> Xuất JSON
                </button>
                <button className="btn-topbar" onClick={() => fileInputRef.current?.click()}>
                  <IconUpload size={15} /> Nhập JSON
                </button>
                <button className="btn-topbar danger" onClick={handleReset}>
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

            <div className="user-pill">
              <span className="user-pill-name">{currentUser.name}</span>
              <span className={`user-pill-role ${isAdmin ? 'role-admin' : 'role-guest'}`}>
                {roleBadge}
              </span>
              <button className="user-pill-logout" onClick={logout} title="Đăng xuất">
                <IconLock size={14} />
              </button>
            </div>
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
          {tab === 'accounts' && <AccountsPanel />}
          {tab === 'matches' && <MatchesPanel />}
          {tab === 'history' && <HistoryPanel />}
        </div>
      </main>

      <footer className="footer">
        <div className="content-inner">
          {isAdmin
            ? <>Chế độ quản trị. Dùng <b>Xuất JSON</b> để sao lưu dữ liệu.</>
            : `Đăng nhập với quyền ${roleBadge}. Có thể đăng ký sân và ghi kết quả trận đấu.`}
        </div>
      </footer>
    </div>
  )
}
