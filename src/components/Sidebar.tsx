import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTheme } from '../store/themeContext'

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: 'dashboard', to: '/' },
  { id: 'transactions', label: 'Movimientos', icon: 'transactions', to: '/movimientos' },
  { id: 'categories', label: 'Categorías', icon: 'categories', to: '/categorias' },
  { id: 'accounts', label: 'Cuentas', icon: 'accounts', to: '/cuentas' },
  { id: 'investments', label: 'Inversiones', icon: 'investments' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
]

function Sidebar() {
  const { mode, theme, cycleMode } = useTheme()
  const nextLabel =
    mode === 'system' ? 'Forzar claro' : mode === 'light' ? 'Forzar oscuro' : 'Usar sistema'
  const themeLabel =
    mode === 'system'
      ? `Sistema (${theme === 'dark' ? 'oscuro' : 'claro'})`
      : mode === 'dark'
        ? 'Oscuro'
        : 'Claro'
  const themeIcon = mode === 'system' ? 'system' : mode === 'dark' ? 'moon' : 'sun'

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
              key={item.id}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item--active' : ''}`
              }
            >
              <span className="nav-item__icon">
                <Icon name={item.icon} size={19} />
              </span>
              <span className="nav-item__label">{item.label}</span>
            </NavLink>
          ) : (
            <button key={item.id} type="button" className="nav-item nav-item--soon" disabled>
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
          type="button"
          className="theme-toggle"
          onClick={cycleMode}
          aria-label={`Tema actual: ${themeLabel}. ${nextLabel}`}
          title={nextLabel}
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
          <span className="user-chip__avatar">F</span>
          <div className="user-chip__info">
            <span className="user-chip__name">Ferran</span>
            <span className="user-chip__plan">Plan personal</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
