import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { StoreProvider } from './store/StoreContext.jsx'
import { AuthProvider } from './store/AuthContext.jsx'
import { AccountsProvider } from './store/AccountsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AccountsProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </AccountsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
