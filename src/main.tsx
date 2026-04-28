import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { expandApp, setBackgroundColor, setHeaderColor } from './lib/telegram'
import { initPostHog } from './lib/posthog'
import { COLORS } from './theme'

initPostHog()
expandApp()
setHeaderColor(COLORS.cream)
setBackgroundColor(COLORS.cream)

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element #root not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
