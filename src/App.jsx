import { useRef, useState } from 'react'
import { useStore } from './store/StoreContext.jsx'
import { useAccounts } from './store/AccountsContext.jsx'
import { useAuth } from './store/AuthContext.jsx'
import { activeSession } from './utils/helpers.js'
import CourtsPanel from './components/CourtsPanel.jsx'
import AccountsPanel from './components/AccountsPanel.jsx'
import MatchesPanel from './components/MatchesPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import FinancePanel from './components/FinancePanel.jsx'
import RankingPanel from './components/RankingPanel.jsx'
import BrandMenu from './components/BrandMenu.jsx'
import {
  IconCourt,
  IconUsers,
  IconTrophy,
  IconClock,
  IconWallet,
  IconRanking,
  IconDownload,
  IconUpload,
  IconTrash,
} from './components/Icons.jsx'

const TABS = [
  { id: 'courts', label: 'Quản lý sân', Icon: IconCourt },
  { id: 'accounts', label: 'Thành viên', Icon: IconUsers },
  { id: 'matches', label: 'Trận đấu', Icon: IconTrophy },
  { id: 'history', label: 'Lịch sử', Icon: IconClock },
  { id: 'finance', label: 'Tài chính', Icon: IconWallet },
  { id: 'ranking', label: 'Xếp hạng', Icon: IconRanking },
]

export default function App() {
  const { data, isReady: storeReady, actions } = useStore()
  const { accounts, isReady: accountsReady, importAccounts } = useAccounts()
  const { isAdmin, isLoggedIn } = useAuth()
  const [tab, setTab] = useState('courts')
  const fileInputRef = useRef(null)

  if (!storeReady || !accountsReady) {
    return <div className="app-loading">Đang tải dữ liệu…</div>
  }

  const openCount = data.courts.filter((c) => activeSession(data.sessions, c.id)).length
  const activePlayers = data.sessions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.participantIds.length, 0)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ ...data, accounts }, null, 2)], { type: 'application/json' })
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
        const parsed = JSON.parse(reader.result)
        actions.importData(parsed)
        if (Array.isArray(parsed.accounts)) importAccounts(parsed.accounts)
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

  const statusText = openCount > 0 ? `${openCount} sân đang mở` : 'Tất cả sân đang đóng'

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <BrandMenu />

          {/* <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-icon">👥</span>
              <span className="header-stat-num">{accounts.length}</span>
              <span className="header-stat-label">Thành viên</span>
            </div>
            <div className="header-stat-sep" />
            <div className="header-stat">
              <span className="header-stat-icon">🏸</span>
              <span className="header-stat-num">{data.matches.length}</span>
              <span className="header-stat-label">Trận đấu</span>
            </div>
            <div className="header-stat-sep" />
            <div className="header-stat">
              <span className="header-stat-icon">🔥</span>
              <span className="header-stat-num">{activePlayers}</span>
              <span className="header-stat-label">Đang thi đấu</span>
            </div>
          </div> */}

          <div className="topbar-right">
            {isAdmin && (
              <div className="topbar-actions">
                <button className="btn-topbar" onClick={handleExport} title="Xuất JSON">
                  <IconDownload size={15} /><span className="btn-text"> Xuất JSON</span>
                </button>
                <button className="btn-topbar" onClick={() => fileInputRef.current?.click()} title="Nhập JSON">
                  <IconUpload size={15} /><span className="btn-text"> Nhập JSON</span>
                </button>
                <button className="btn-topbar danger" onClick={handleReset} title="Xoá hết">
                  <IconTrash size={15} /><span className="btn-text"> Xoá hết</span>
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
                  <span className="tab-label">{label}</span>
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
          {tab === 'finance' && <FinancePanel />}
          {tab === 'ranking' && <RankingPanel />}
        </div>
      </main>

      <footer className="footer">
        <div className="content-inner">
          {isAdmin
            ? <>Chế độ quản trị. Dùng <b>Xuất JSON</b> để sao lưu dữ liệu.</>
            : isLoggedIn
              ? 'Đã đăng nhập. Có thể đăng ký sân và ghi kết quả trận đấu.'
              : 'Đang xem với quyền khách. Nhấn tên câu lạc bộ góc trên bên trái để đăng nhập.'}
        </div>
      </footer>
    </div>
  )
}
