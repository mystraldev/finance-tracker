import { NavLink } from 'react-router-dom'

import { useAuth } from '../store/authContext'
import { useTheme } from '../store/themeContext'
import Icon from './Icon'

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: 'dashboard', to: '/' },
  { id: 'transactions', label: 'Movimientos', icon: 'transactions', to: '/movimientos' },
  { id: 'categories', label: 'Categorías', icon: 'categories', to: '/categorias' },
  { id: 'accounts', label: 'Cuentas', icon: 'accounts', to: '/cuentas' },
  { id: 'import', label: 'Importar', icon: 'upload', to: '/importar' },
  { id: 'investments', label: 'Inversiones', icon: 'investments' },
  { id: 'settings', label: 'Ajustes', icon: 'settings', to: '/ajustes' },
]

export default function Sidebar() {
  const { mode, theme, cycleMode } = useTheme()
  const { user, signOut } = useAuth()
  const userInitial = (user?.email ?? '?').charAt(0).toUpperCase()

  function getNextLabel(): string {
    if (mode === 'system') return 'Forzar claro'
    if (mode === 'light') return 'Forzar oscuro'
    return 'Usar sistema'
  }

  function getThemeLabel(): string {
    if (mode === 'system') return `Sistema (${theme === 'dark' ? 'oscuro' : 'claro'})`
    if (mode === 'dark') return 'Oscuro'
    return 'Claro'
  }

  function getThemeIcon(): string {
    if (mode === 'system') return 'system'
    if (mode === 'dark') return 'moon'
    return 'sun'
  }

  const nextLabel = getNextLabel()
  const themeLabel = getThemeLabel()
  const themeIcon = getThemeIcon()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">€</span>
        <span className="sidebar__name">Finance Tracker</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) =>
          item.to ? (
            <NavLink
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item--active' : ''}`
              }
              end={item.to === '/'}
              key={item.id}
              to={item.to}
            >
              <span className="nav-item__icon">
                <Icon name={item.icon} size={19} />
              </span>
              <span className="nav-item__label">{item.label}</span>
            </NavLink>
          ) : (
            <button className="nav-item nav-item--soon" disabled key={item.id} type="button">
              <span className="nav-item__icon">
                <Icon name={item.icon} size={19} />
              </span>
              <span className="nav-item__label">{item.label}</span>
              <span className="nav-item__soon">pronto</span>
            </button>
          ),
        )}
      </nav>

      <div className="sidebar__footer">
        <button
          aria-label={`Tema actual: ${themeLabel}. ${nextLabel}`}
          className="theme-toggle"
          onClick={cycleMode}
          title={nextLabel}
          type="button"
        >
          <span className="theme-toggle__icon">
            <Icon name={themeIcon} size={17} />
          </span>
          <span className="theme-toggle__text">
            <span className="theme-toggle__label">Tema</span>
            <span className="theme-toggle__value">{themeLabel}</span>
          </span>
        </button>

        <div className="user-chip">
          <span className="user-chip__avatar">{userInitial}</span>
          <div className="user-chip__info">
            <span className="user-chip__name" title={user?.email ?? undefined}>
              {user?.email ?? 'Invitado'}
            </span>
            <button
              className="user-chip__signout"
              onClick={() => void signOut()}
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
