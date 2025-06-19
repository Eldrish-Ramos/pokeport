import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PokeSets from './pages/PokeSets'
import './App.css'
import Home from './pages/Home'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sets" element={<PokeSets />} />
      </Routes>
      <Footer />
    </>
  )
}