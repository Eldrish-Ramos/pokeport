import 'bootstrap/dist/css/bootstrap.min.css'
import { Link, useNavigate } from 'react-router-dom'
import pokeball from '../assets/pokeball.png'
import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { setTheme } = useTheme() // <-- import setTheme from context

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    const handler = () => setIsLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('authchange', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('authchange', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('authchange'))
    setIsLoggedIn(false)
    setTheme('default') // <-- Reset theme to default on logout
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black py-2">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
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
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/sets">Card Sets</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/themes">Themes</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/collection">Collection</Link>
            </li>
          </ul>
          {isLoggedIn ? (
            <button
              className="btn btn-outline-light btn-sm px-4"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="btn btn-danger btn-sm px-4"
              type="button"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}