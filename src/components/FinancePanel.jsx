import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { useAuth } from '../store/AuthContext.jsx'
import { IconPlus, IconPencil, IconTrash } from './Icons.jsx'

function fmtMoney(n) {
  return n.toLocaleString('vi-VN')
}

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const TYPE_LABEL = { thu: 'Thu', chi: 'Chi', 'thu-thieu': 'Thu (còn thiếu)' }
const TYPE_OPTS = [
  { value: '', label: 'Tất cả' },
  { value: 'thu', label: 'Thu' },
  { value: 'thu-thieu', label: 'Thu (còn thiếu)' },
  { value: 'chi', label: 'Chi' },
]
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

function emptyForm() {
  const today = new Date().toISOString().slice(0, 10)
  return { date: today, type: 'thu', purpose: 'Tiền sân\nNữ 50k\nNam 60k', amount: '', note: '' }
}

export default function FinancePanel() {
  const { data, actions } = useStore()
  const { isAdmin } = useAuth()
  const { finance } = data

  const [filterType, setFilterType] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [editingBalance, setEditingBalance] = useState(false)
  const [balanceInput, setBalanceInput] = useState(String(finance.openingBalance))

  const entries = useMemo(() => {
    let list = [...finance.entries]
    if (filterType) list = list.filter((e) => e.type === filterType)
    if (filterMonth) list = list.filter((e) => e.date && e.date.slice(5, 7) === filterMonth.padStart(2, '0'))
    list.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
    return list
  }, [finance.entries, filterType, filterMonth])

  const { totalThu, totalThieu, totalChi, byMonth } = useMemo(() => {
    let thu = 0, thieu = 0, chi = 0
    const monthly = {}
    for (const e of finance.entries) {
      const month = e.date ? parseInt(e.date.slice(5, 7), 10) : 0
      if (!monthly[month]) monthly[month] = { thu: 0, thieu: 0, chi: 0 }
      if (e.type === 'chi') { chi += e.amount; monthly[month].chi += e.amount }
      else if (e.type === 'thu-thieu') { thieu += e.amount; monthly[month].thieu += e.amount }
      else { thu += e.amount; monthly[month].thu += e.amount }
    }
    return { totalThu: thu, totalThieu: thieu, totalChi: chi, byMonth: monthly }
  }, [finance.entries])

  // Chênh lệch chỉ tính Thu - Chi, không tính Thu còn thiếu
  const remaining = finance.openingBalance + totalThu - totalChi

  const openAdd = () => { setForm(emptyForm()); setEditId(null); setShowForm(true) }
  const openEdit = (e) => {
    setForm({ date: e.date, type: e.type, purpose: e.purpose, amount: String(e.amount), note: e.note || '' })
    setEditId(e.id)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditId(null) }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const payload = { ...form, amount: Number(form.amount.replace(/\D/g, '')) || 0 }
    if (!payload.purpose.trim() || !payload.date) return
    if (editId) actions.updateFinanceEntry(editId, payload)
    else actions.addFinanceEntry(payload)
    closeForm()
  }

  const handleAmountInput = (val) => {
    setForm((f) => ({ ...f, amount: val.replace(/\D/g, '') }))
  }

  const saveBalance = () => {
    actions.setOpeningBalance(Number(balanceInput.replace(/\D/g, '')) || 0)
    setEditingBalance(false)
  }

  return (
    <section>
      <div className="panel-head">
        <h2>Quản lý thu chi</h2>
        <p className="muted">
          {isAdmin
            ? 'Quản lý thu chi câu lạc bộ. Bấm vào số dư đầu kỳ để chỉnh sửa.'
            : 'Xem báo cáo thu chi câu lạc bộ.'}
        </p>
      </div>

      <div className="finance-layout">
        {/* ---- LEFT: Summary ---- */}
        <div className="finance-summary">
          {/* Totals card */}
          <div className="fin-summary-card">
            <div className="fin-summary-title">Tổng quan</div>
            <table className="fin-totals-table">
              <tbody>
                <tr>
                  <td>Số tiền đầu kỳ</td>
                  <td className="fin-amount">
                    {editingBalance ? (
                      <span className="fin-balance-edit">
                        <input
                          className="input fin-balance-input"
                          type="text"
                          value={balanceInput}
                          onChange={(e) => setBalanceInput(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveBalance()
                            if (e.key === 'Escape') setEditingBalance(false)
                          }}
                          autoFocus
                        />
                        <button className="btn btn-primary" onClick={saveBalance}>Lưu</button>
                      </span>
                    ) : (
                      <span
                        className={isAdmin ? 'fin-balance-value editable' : 'fin-balance-value'}
                        onClick={() => {
                          if (isAdmin) { setBalanceInput(String(finance.openingBalance)); setEditingBalance(true) }
                        }}
                        title={isAdmin ? 'Bấm để sửa' : undefined}
                      >
                        {fmtMoney(finance.openingBalance)}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="fin-row-thu">
                  <td>Tổng thu</td>
                  <td className="fin-amount">{fmtMoney(totalThu)}</td>
                </tr>
                <tr className="fin-row-thieu">
                  <td>Thu (còn thiếu)</td>
                  <td className="fin-amount">{fmtMoney(totalThieu)}</td>
                </tr>
                <tr className="fin-row-chi">
                  <td>Tổng chi</td>
                  <td className="fin-amount">{fmtMoney(totalChi)}</td>
                </tr>
                <tr className={`fin-row-remaining ${remaining < 0 ? 'negative' : ''}`}>
                  <td><b>Còn lại</b></td>
                  <td className="fin-amount"><b>{fmtMoney(remaining)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly card */}
          <div className="fin-summary-card">
            <div className="fin-summary-title">Thống kê theo tháng</div>
            <div style={{ overflowX: 'auto' }}>
            <table className="fin-monthly-table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Thu</th>
                  <th>Thu (thiếu)</th>
                  <th>Chi</th>
                  <th>Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m) => {
                  const mInt = parseInt(m, 10)
                  const mData = byMonth[mInt] || { thu: 0, thieu: 0, chi: 0 }
                  const diff = mData.thu - mData.chi
                  const hasData = mData.thu > 0 || mData.thieu > 0 || mData.chi > 0
                  return (
                    <tr key={m} className={hasData ? (diff >= 0 ? 'month-pos' : 'month-neg') : 'month-empty'}>
                      <td>{m}</td>
                      <td>{hasData ? fmtMoney(mData.thu) : '0'}</td>
                      <td className="fin-col-thieu">{mData.thieu > 0 ? fmtMoney(mData.thieu) : '0'}</td>
                      <td>{hasData ? fmtMoney(mData.chi) : '0'}</td>
                      <td className={diff < 0 ? 'diff-neg' : diff > 0 ? 'diff-pos' : ''}>
                        {hasData ? fmtMoney(diff) : '0'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* ---- RIGHT: Entries ---- */}
        <div className="fin-summary-card" style={{ overflow: 'hidden' }}>
          <div className="fin-entries-head">
            <span className="fin-summary-title" style={{ border: 'none', padding: 0 }}>
              Bảng quản lý thu chi
            </span>
            <div className="fin-filters">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input"
                style={{ width: 'auto', flex: 'none' }}
              >
                <option value="">Tất cả tháng</option>
                {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
                style={{ width: 'auto', flex: 'none' }}
              >
                {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {isAdmin && (
                <button className="btn btn-primary" onClick={openAdd}>
                  <IconPlus size={15} /> Thêm
                </button>
              )}
            </div>
          </div>

          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Mục đích sử dụng</th>
                  <th className="fin-col-amount">Số tiền</th>
                  <th>Ghi chú</th>
                  {isAdmin && <th />}
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="fin-empty">Chưa có dữ liệu</td>
                  </tr>
                )}
                {entries.map((e) => (
                  <tr
                    key={e.id}
                    className={
                      e.type === 'chi' ? 'fin-row-chi'
                      : e.type === 'thu-thieu' ? 'fin-row-thieu'
                      : 'fin-row-thu'
                    }
                  >
                    <td className="fin-date">{fmtDate(e.date)}</td>
                    <td>
                      <span className={`fin-type-badge fin-type-${e.type}`}>
                        {TYPE_LABEL[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="fin-purpose">{e.purpose}</td>
                    <td className="fin-col-amount">{fmtMoney(e.amount)}</td>
                    <td className="fin-note">{e.note}</td>
                    {isAdmin && (
                      <td>
                        <div className="row-actions">
                          <button className="btn-link" onClick={() => openEdit(e)} title="Sửa">
                            <IconPencil size={14} /> Sửa
                          </button>
                          <button
                            className="btn-link danger"
                            onClick={() => { if (confirm('Xoá mục này?')) actions.removeFinanceEntry(e.id) }}
                            title="Xoá"
                          >
                            <IconTrash size={14} /> Xoá
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---- Add / Edit modal ---- */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editId ? 'Sửa mục thu chi' : 'Thêm mục thu chi'}</h3>
              <button className="icon-btn modal-close-btn" onClick={closeForm} title="Đóng">
                <span style={{ fontSize: 18, lineHeight: 1 }}>×</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-section">
                <div className="field">
                  <label>Ngày</label>
                  <input
                    className="input"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Loại</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="thu">Thu</option>
                    <option value="thu-thieu">Thu (còn thiếu)</option>
                    <option value="chi">Chi</option>
                  </select>
                </div>
                <div className="field">
                  <label>Mục đích sử dụng</label>
                  <textarea
                    className="input"
                    required
                    rows={3}
                    placeholder="VD: Tiền sân tháng 6"
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="field">
                  <label>Số tiền (VNĐ)</label>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 1.360.000"
                    value={form.amount ? Number(form.amount).toLocaleString('vi-VN') : ''}
                    onChange={(e) => handleAmountInput(e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Ghi chú</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Tên thành viên, ghi chú thêm..."
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-section" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-outline" onClick={closeForm}>Huỷ</button>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Lưu thay đổi' : 'Thêm mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
