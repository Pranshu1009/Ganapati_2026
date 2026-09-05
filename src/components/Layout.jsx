import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/collect', label: 'Chanda' },
  { to: '/donations', label: 'Donors' },
  { to: '/expenses', label: 'Spend' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <div className="bg-glow" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div className="brand-text">
            <p className="brand-name">Gokul Dhara Society</p>
            <p className="brand-tag">Ganapati Pandal · Money Flow</p>
          </div>
        </div>

        <div className="topbar-actions">
          <p className="user-chip" title={user?.username}>
            {user?.name || user?.username}
          </p>
          <button type="button" className="btn ghost logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <nav className="nav desktop-nav" aria-label="Main">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
