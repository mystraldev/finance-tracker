import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import { AuthProvider } from './store/AuthProvider'
import { FinanceProvider } from './store/FinanceProvider'
import { ThemeProvider } from './store/ThemeProvider'

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
