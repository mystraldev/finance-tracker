import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Layout from './components/Layout'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import TransactionsPage from './pages/TransactionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
