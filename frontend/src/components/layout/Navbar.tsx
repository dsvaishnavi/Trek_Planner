import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiBell, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useNotifications } from '../../hooks/useNotifications'
import { formatDate, getInitials } from '../../utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/planner', label: 'AI Planner' },
  { to: '/chat', label: 'Chat' },
  { to: '/journey', label: 'Journey' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/profile', label: 'Profile' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="glass-nav fixed-top" style={{ height: 'var(--tv-navbar-h)', zIndex: 1030 }}>
      <div className="container h-100 d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="brand-logo text-decoration-none flex-shrink-0">
          <span aria-hidden>🌍</span> TrekVerse AI
        </Link>

        <div className="d-none d-lg-flex align-items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `nav-link px-3 py-2 rounded-pill ${isActive ? 'fw-semibold text-primary-tv' : 'text-muted-tv'}`
              }
              style={{ fontSize: '0.92rem' }}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost border-0 p-2"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {isAuthenticated && (
            <div className="position-relative">
              <button
                type="button"
                className="btn btn-sm btn-ghost border-0 p-2 position-relative"
                onClick={() => setBellOpen((v) => !v)}
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                    style={{ background: 'var(--tv-accent)', fontSize: '0.65rem' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div
                  className="glass-card position-absolute end-0 mt-2 p-0 overflow-hidden"
                  style={{ width: 320, zIndex: 1050 }}
                >
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ borderColor: 'var(--tv-border)' }}>
                    <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
                    <button type="button" className="btn btn-link btn-sm p-0" onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.length === 0 && (
                      <p className="text-muted-tv small p-3 mb-0">No notifications yet.</p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="w-100 text-start border-0 bg-transparent px-3 py-2"
                        style={{
                          opacity: n.read ? 0.65 : 1,
                          borderBottom: '1px solid var(--tv-border)',
                        }}
                        onClick={() => {
                          markRead(n.id)
                          setBellOpen(false)
                          if (n.link) navigate(n.link)
                        }}
                      >
                        <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{n.title}</div>
                        <div className="text-muted-tv" style={{ fontSize: '0.78rem' }}>{n.message}</div>
                        <div className="text-muted-tv mt-1" style={{ fontSize: '0.7rem' }}>
                          {formatDate(n.created_at)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="dropdown d-none d-lg-block">
              <button
                className="btn btn-sm d-flex align-items-center gap-2 border-0 p-1"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-circle object-fit-cover"
                  />
                ) : (
                  <span
                    className="rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                    style={{ width: 36, height: 36, background: 'var(--tv-gradient)', fontSize: '0.75rem' }}
                  >
                    {getInitials(user?.username || user?.email || 'U')}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                <li><Link className="dropdown-item" to="/journey">My Journey</Link></li>
                <li><Link className="dropdown-item" to="/leaderboard">Leaderboard</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" type="button" onClick={() => { logout(); navigate('/') }}>
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-none d-lg-flex gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-gradient btn-sm">Register</Link>
            </div>
          )}

          <button
            type="button"
            className="btn btn-sm d-lg-none p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="d-lg-none border-top px-3 pb-3 pt-2" style={{ background: 'var(--tv-bg-elevated)', borderColor: 'var(--tv-border)' }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className="d-block py-2 text-decoration-none"
              style={{ color: 'var(--tv-text)' }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <hr style={{ borderColor: 'var(--tv-border)' }} />
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-ghost w-100"
              onClick={() => { logout(); setOpen(false); navigate('/') }}
            >
              Log out
            </button>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-ghost flex-fill" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-gradient flex-fill" onClick={() => setOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
