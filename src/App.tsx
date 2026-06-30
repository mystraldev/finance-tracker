import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import TransactionsPage from './pages/TransactionsPage'
import { FinanceProvider } from './store/FinanceProvider'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route
          element={
            <ProtectedRoute>
              <FinanceProvider>
                <Layout />
              </FinanceProvider>
            </ProtectedRoute>
          }
        >
          <Route element={<DashboardPage />} path="/" />
          <Route element={<TransactionsPage />} path="/movimientos" />
          <Route element={<CategoriesPage />} path="/categorias" />
          <Route element={<AccountsPage />} path="/cuentas" />
          <Route element={<SettingsPage />} path="/ajustes" />
          <Route element={<DashboardPage />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
