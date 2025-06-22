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
    setTheme('default') // <-- Reset theme to default on logout
    navigate('/')
  }

  function closeNavbar() {
    const navbar = document.getElementById('mainNav');
    if (navbar && navbar.classList.contains('show')) {
      // @ts-ignore
      window.bootstrap?.Collapse.getOrCreateInstance(navbar).hide();
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black py-2">
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
              <Link className="nav-link" to="/themes" onClick={closeNavbar}>Themes</Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link" to="/collection" onClick={closeNavbar}>Collection</Link>
            </li>
          </ul>
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
    </nav>
  )
}