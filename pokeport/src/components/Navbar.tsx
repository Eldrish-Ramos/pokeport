import 'bootstrap/dist/css/bootstrap.min.css'
import { Link, useNavigate } from 'react-router-dom'
import pokeball from '../assets/pokeball.png'
import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FaCog } from 'react-icons/fa'
import { TYPE_COLORS } from '../constants/themes'
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

  // Add a state to detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 992)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
          {/* Mobile/desktop wrapper */}
          <div className={isMobile ? "navbar-mobile-actions w-100 d-flex flex-column align-items-center mt-3" : "d-flex align-items-center position-relative"} style={isMobile ? {} : { marginRight: '1em' }}>
            {/* Cogwheel Dropdown */}
            <div
              ref={dropdownRef}
              style={{ position: 'relative', width: isMobile ? '100%' : undefined }}
              className={isMobile ? "w-100" : ""}
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
                  marginRight: isMobile ? 0 : '0.5em',
                  marginBottom: isMobile ? '1em' : 0,
                  cursor: 'pointer',
                  width: isMobile ? 48 : undefined,
                  height: isMobile ? 48 : undefined,
                }}
                onBlur={() => setShowDropdown(false)}
                title="Theme settings"
              >
                <FaCog />
              </button>
              {showDropdown && (
                <ul
                  className="dropdown-menu show"
                  style={{
                    ...dropdownStyle,
                    ...(isMobile
                      ? {
                          position: 'fixed',
                          left: 0,
                          right: 0,
                          top: 70,
                          minWidth: 'unset',
                          width: '90vw',
                          margin: '0 auto',
                          borderRadius: 12,
                          zIndex: 9999,
                        }
                      : {}),
                  }}
                >
                  <li
                    className="dropdown-item"
                    style={{ cursor: 'pointer', position: 'relative', width: isMobile ? '100%' : undefined }}
                    onMouseEnter={() => !isMobile && setShowThemeSubmenu(true)}
                    onMouseLeave={() => !isMobile && setShowThemeSubmenu(false)}
                    onClick={() => isMobile && setShowThemeSubmenu(v => !v)}
                  >
                    &laquo; Themes
                    {/* Desktop: submenu on hover; Mobile: show options inline when toggled */}
                    {(showThemeSubmenu || isMobile) && (
                      <ul
                        className="dropdown-menu show"
                        style={{
                          ...submenuStyle,
                          ...(isMobile
                            ? {
                                position: 'static',
                                minWidth: 'unset',
                                width: '100%',
                                boxShadow: 'none',
                                border: 'none',
                                background: 'transparent',
                                marginTop: 8,
                              }
                            : {}),
                        }}
                      >
                        {Object.keys(TYPE_COLORS).map(type => (
                          <li key={type}>
                            <button
                              className="dropdown-item d-flex align-items-center"
                              style={{
                                color: TYPE_COLORS[type],
                                fontWeight: theme === type ? 'bold' : undefined,
                                background: theme === type ? '#222' : undefined,
                                width: isMobile ? '100%' : undefined,
                              }}
                              onMouseDown={() => {
                                saveTheme(type)
                                setShowDropdown(false)
                                setShowThemeSubmenu(false)
                              }}
                            >
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
                style={isMobile ? { width: '100%' } : {}}
                onClick={() => { closeNavbar(); handleLogout(); }}
              >
                Logout
              </button>
            ) : (
              <button
                className="btn btn-danger btn-sm px-4"
                type="button"
                style={isMobile ? { width: '100%' } : {}}
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