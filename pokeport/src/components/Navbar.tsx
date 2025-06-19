import 'bootstrap/dist/css/bootstrap.min.css'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black py-2">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span role="img" aria-label="Pokeball" style={{ fontSize: '1.5em', marginRight: '0.5em' }}>⚪️🔴</span>
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
              <a className="nav-link" href="#">My Collection</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link" href="#">Pricing</a>
            </li>
          </ul>
          <form className="d-flex me-3" role="search">
            <input className="form-control form-control-sm bg-dark text-white border-secondary" type="search" placeholder="Search cards..." aria-label="Search" />
          </form>
          <button className="btn btn-danger btn-sm px-4" type="button">Sign In</button>
        </div>
      </div>
    </nav>
  )
}