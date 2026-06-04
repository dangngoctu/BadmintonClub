import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const DATA_DIR = join(__dirname, 'data')
const PORT = process.env.PORT || 4173

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR)
if (!existsSync(DIST)) {
  console.error('\n  ✗ Chưa có thư mục dist. Hãy chạy "npm run build" trước.\n')
  process.exit(1)
}

const ACCOUNTS_FILE = join(DATA_DIR, 'accounts.json')
const APPDATA_FILE = join(DATA_DIR, 'appdata.json')

const defaultAccounts = () => [
  {
    id: 'acc-default-admin',
    name: 'Admin',
    password: 'theb123',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
]

const defaultAppdata = () => ({
  courts: [
    { id: 'court-1', name: 'Sân 1' },
    { id: 'court-2', name: 'Sân 2' },
  ],
  sessions: [],
  matches: [],
  finance: { openingBalance: 0, entries: [] },
})

function readJSON(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf-8')) }
  catch { return fallback }
}

function handleAPI(req, res, file, fallback) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method === 'GET') {
    res.end(JSON.stringify(readJSON(file, fallback())))
    return
  }
  if (req.method === 'PUT') {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      try {
        writeFileSync(file, JSON.stringify(JSON.parse(raw), null, 2), 'utf-8')
        res.end('{"ok":true}')
      } catch (e) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }
  res.statusCode = 405
  res.end()
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  let filePath = join(DIST, url.pathname)

  // SPA fallback: nếu file không tồn tại → trả về index.html
  try {
    const stat = statSync(filePath)
    if (stat.isDirectory()) filePath = join(DIST, 'index.html')
  } catch {
    filePath = join(DIST, 'index.html')
  }

  try {
    const ext = extname(filePath)
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
    res.end(readFileSync(filePath))
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
}

const server = createServer((req, res) => {
  const path = new URL(req.url, `http://localhost:${PORT}`).pathname
  if (path === '/api/accounts') return handleAPI(req, res, ACCOUNTS_FILE, defaultAccounts)
  if (path === '/api/appdata')  return handleAPI(req, res, APPDATA_FILE, defaultAppdata)
  serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log(`\n  ✓ Ứng dụng đang chạy tại: http://localhost:${PORT}\n`)
})
