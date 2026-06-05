import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: 'dashboard', to: '/' },
  { id: 'transactions', label: 'Movimientos', icon: 'transactions', to: '/movimientos' },
  { id: 'categories', label: 'Categorías', icon: 'categories', to: '/categorias' },
  { id: 'accounts', label: 'Cuentas', icon: 'accounts', to: '/cuentas' },
  { id: 'investments', label: 'Inversiones', icon: 'investments' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
] as const

function Sidebar() {
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
            <button key={item.id} type="button" className="nav-item" disabled>
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
