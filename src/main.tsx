import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { FinanceProvider } from './store/FinanceProvider'
import { ThemeProvider } from './store/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
