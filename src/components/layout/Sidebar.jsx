import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo/scentia-hunter-logo.png'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◆', end: true },
  { to: '/esencias', label: 'Esencias', icon: '❀' },
  { to: '/inventario', label: 'Inventario', icon: '▤' },
  { to: '/ventas', label: 'Ventas', icon: '⟡' },
  { to: '/probadores', label: 'Probadores', icon: '✦' },
  { to: '/analisis', label: 'Análisis', icon: '◈' },
]

function Sidebar() {
  return (
    <aside className="sh-sidebar">
      <div className="sh-sidebar__brand">
        <div className="sh-sidebar__logo-ring">
          <img src={logo} alt="Scentia Hunter" />
        </div>
        <div>
          <p className="sh-sidebar__brand-name">Scentia Hunter</p>
          <p className="sh-sidebar__brand-tag">El cazador de tu fragancia</p>
        </div>
      </div>

      <nav className="sh-sidebar__nav">
        <span className="sh-eyebrow sh-sidebar__section">Gestión</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'sh-sidebar__link' + (isActive ? ' sh-sidebar__link--active' : '')
            }
          >
            <span className="sh-sidebar__icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sh-sidebar__footer">
        <div className="sh-sidebar__user">
          <div className="sh-sidebar__avatar">JV</div>
          <div>
            <p className="sh-sidebar__user-name">Jhosep Varón</p>
            <p className="sh-sidebar__user-role">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
