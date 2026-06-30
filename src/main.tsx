import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './lib/streamPolyfill'
import App from './App'
import { AuthProvider } from './store/AuthProvider'
import { ThemeProvider } from './store/ThemeProvider'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
