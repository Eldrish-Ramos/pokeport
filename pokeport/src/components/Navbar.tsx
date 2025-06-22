import 'bootstrap/dist/css/bootstrap.min.css'
import { Link, useNavigate } from 'react-router-dom'
import pokeball from '../assets/pokeball.png'
import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FaCog } from 'react-icons/fa'
import { TYPE_COLORS, TYPE_ICONS } from '../constants/themes'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, setTheme, saveTheme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showThemeSubmenu, setShowThemeSubmenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem('token'))
    const handler = () => setIsLoggedIn(!!sessionStorage.getItem('token'))
    window.addEventListener('authchange', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('authchange', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    window.dispatchEvent(new Event('authchange'))
    setIsLoggedIn(false)
    setTheme('default')
    navigate('/')
  }

  function closeNavbar() {
    const navbar = document.getElementById('mainNav');
    if (navbar && navbar.classList.contains('show')) {
      // @ts-ignore
      window.bootstrap?.Collapse.getOrCreateInstance(navbar).hide();
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setShowThemeSubmenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  // Dropdown positioning helpers
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: '2.5em',
    minWidth: 180,
    zIndex: 2000,
    background: '#232323',
    borderRadius: 8,
    boxShadow: '0 4px 16px #0005',
    padding: 0,
    border: '1px solid #333',
  }
  const submenuStyle: React.CSSProperties = {
    position: 'absolute',
    right: '100%', // <-- open submenu to the left
    top: 0,
    minWidth: 220,
    zIndex: 2100,
    background: '#232323',
    borderRadius: 8,
    boxShadow: '0 4px 16px #0005',
    padding: 0,
    border: '1px solid #333',
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black py-2" style={{ position: 'relative' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeNavbar}>
          <img
            src={pokeball}
            alt="Pokeball"
            style={{ height: '1.5em', width: '1.5em', marginRight: '0.5em' }}
          />
          PokéPort
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/" onClick={closeNavbar}>Home</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/sets" onClick={closeNavbar}>Card Sets</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/collection" onClick={closeNavbar}>Collection</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center position-relative" style={{ marginRight: '1em' }}>
            {/* Cogwheel Dropdown */}
            <div
              ref={dropdownRef}
              style={{ position: 'relative' }}
            >
              <button
                className="theme-cog-btn"
                aria-label="Theme settings"
                onClick={() => setShowDropdown(v => !v)}
                tabIndex={0}
                style={{
                  background: 'var(--theme-card-bg)',
                  border: '2px solid var(--theme-accent2)',
                  borderRadius: '50%',
                  padding: '0.45em',
                  boxShadow: showDropdown ? '0 0 0 3px var(--theme-accent2)' : '0 2px 8px #0004',
                  transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1em',
                  color: 'var(--theme-accent2)',
                  outline: 'none',
                  marginRight: '0.5em',
                  cursor: 'pointer',
                }}
                onBlur={() => setShowDropdown(false)}
                title="Theme settings"
              >
                <FaCog />
              </button>
              {showDropdown && (
                <ul className="dropdown-menu show" style={dropdownStyle}>
                  <li
                    className="dropdown-item"
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onMouseEnter={() => setShowThemeSubmenu(true)}
                    onMouseLeave={() => setShowThemeSubmenu(false)}
                  >
                   &laquo; Themes
                    {showThemeSubmenu && (
                      <ul className="dropdown-menu show" style={submenuStyle}>
                        {Object.keys(TYPE_COLORS).map(type => (
                          <li key={type}>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              style={{
                                color: TYPE_COLORS[type],
                                fontWeight: theme === type ? 'bold' : undefined,
                                background: theme === type ? '#222' : undefined,
                              }}
                              onMouseDown={() => {
                                saveTheme(type)
                                // Optionally keep dropdown open after selection, or close:
                                // setShowDropdown(false)
                                setShowThemeSubmenu(false)
                              }}
                            >
                              <img
                                src={TYPE_ICONS[type] || '/vite.svg'}
                                alt={type}
                                style={{
                                  width: 24,
                                  height: 24,
                                  marginRight: 8,
                                  background: TYPE_COLORS[type] + '22',
                                  borderRadius: '50%',
                                }}
                              />
                              {type === 'default' ? 'Default (Red/Black)' : type}
                              {theme === type && (
                                <span className="ms-auto badge bg-success">Selected</span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              )}
            </div>
            {isLoggedIn ? (
              <button
                className="btn btn-outline-light btn-sm px-4"
                type="button"
                onClick={() => { closeNavbar(); handleLogout(); }}
              >
                Logout
              </button>
            ) : (
              <button
                className="btn btn-danger btn-sm px-4"
                type="button"
                onClick={() => { closeNavbar(); navigate('/login'); }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}