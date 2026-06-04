const API = '/api/accounts'

export async function loadAccounts() {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error(res.statusText)
    const list = await res.json()
    return Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Không tải được accounts:', err)
    return []
  }
}

export async function saveAccounts(list) {
  try {
    await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })
  } catch (err) {
    console.error('Không lưu được accounts:', err)
  }
}

export function genAccountId() {
  return 'acc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
