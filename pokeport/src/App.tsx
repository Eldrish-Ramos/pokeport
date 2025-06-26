import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PokeSets from './pages/PokeSets'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Themes from './pages/Themes'
import Collection from './pages/Collection'
import Artist from './pages/Artist'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sets" element={<PokeSets />} />
          <Route path="/themes" element={<Themes />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/artists" element={<Artist />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}