import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

function dataApiPlugin() {
  const DATA_DIR = join(process.cwd(), 'data')
  const ACCOUNTS_FILE = join(DATA_DIR, 'accounts.json')
  const APPDATA_FILE = join(DATA_DIR, 'appdata.json')

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR)

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
  })

  const readJSON = (file, fallback) => {
    try {
      return JSON.parse(readFileSync(file, 'utf-8'))
    } catch {
      return fallback
    }
  }

  const handleRoute = (path, getDefault, file) => (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (req.method === 'GET') {
      res.end(JSON.stringify(readJSON(file, getDefault())))
      return
    }
    if (req.method === 'PUT') {
      let raw = ''
      req.on('data', (c) => { raw += c })
      req.on('end', () => {
        try {
          writeFileSync(file, JSON.stringify(JSON.parse(raw), null, 2))
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

  const plugin = {
    name: 'data-api',
    configureServer(server) {
      server.middlewares.use('/api/accounts', handleRoute('/api/accounts', defaultAccounts, ACCOUNTS_FILE))
      server.middlewares.use('/api/appdata', handleRoute('/api/appdata', defaultAppdata, APPDATA_FILE))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/accounts', handleRoute('/api/accounts', defaultAccounts, ACCOUNTS_FILE))
      server.middlewares.use('/api/appdata', handleRoute('/api/appdata', defaultAppdata, APPDATA_FILE))
    },
  }
  return plugin
}

export default defineConfig({
  plugins: [react(), dataApiPlugin()],
})
