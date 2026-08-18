import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/foundation/tokens.css'
import './styles/foundation/reset.css'
import './styles/foundation/globals.css'
import './index.css'
import App from './App'
import './styles/mobile-experience.css'
import './styles/mobile-real-device-fix.css'

import './heroStatsRuntimeCleanup'
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
