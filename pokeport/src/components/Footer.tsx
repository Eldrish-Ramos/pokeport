import 'bootstrap/dist/css/bootstrap.min.css'

export default function Footer() {
  return (
    <footer className="bg-danger text-white text-center py-3 fixed-bottom" style={{ backgroundColor: '#ef5350', width: '100vw' }}>
      <span role="img" aria-label="Pokeball" style={{ fontSize: '1.2em', marginRight: '0.3em' }}></span>
      © {new Date().getFullYear()} PokéPort. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
    </footer>
  )
}