import 'bootstrap/dist/css/bootstrap.min.css'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: '#ef5350', width: '100vw' }}>
      <div className="d-flex w-100 align-items-center px-3">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <span role="img" aria-label="Pokeball" style={{ fontSize: '1.5em', marginRight: '0.5em' }}>⚪️🔴</span>
          PokéPort
        </a>
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 flex-row">
          <li className="nav-item mx-2">
            <Link className="nav-link active" aria-current="page" to="/">Home</Link>
          </li>
          <li className="nav-item mx-2">
            <Link className="nav-link" to="/sets">Sets</Link>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link" href="#">My Collection</a>
          </li>
        </ul>
      </div>
    </nav>
  )
}