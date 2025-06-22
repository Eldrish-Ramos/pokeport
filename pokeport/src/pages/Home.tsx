import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Home.css'

type PopularSet = {
  id: string
  name: string
  cardCount: number
  releaseDate: string
}

const API_KEY = import.meta.env.VITE_POKEMONTCG_API_KEY

const popularSets: PopularSet[] = [
  {
    id: 'base1',
    name: 'Base Set',
    cardCount: 102,
    releaseDate: '1999-01-09',
  },
  {
    id: 'neo1',
    name: 'Neo Genesis',
    cardCount: 111,
    releaseDate: '2000-12-16',
  },
  {
    id: 'swsh1',
    name: 'Sword & Shield',
    cardCount: 202,
    releaseDate: '2020-02-07',
  },
  {
    id: 'sv1',
    name: 'Scarlet & Violet',
    cardCount: 258,
    releaseDate: '2023-03-31',
  },
]

export default function Home() {
  const [setImages, setSetImages] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  useEffect(() => {
    popularSets.forEach(async (set) => {
      try {
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}&pageSize=250`,
          {
            headers: {
              'X-Api-Key': API_KEY,
            },
          }
        )
        const data = await res.json()
        if (data.data && data.data.length > 0) {
          const randomCard = data.data[Math.floor(Math.random() * data.data.length)]
          setSetImages((prev) => ({
            ...prev,
            [set.id]: randomCard.images.large || randomCard.images.small,
          }))
        }
      } catch {
        // fallback: do nothing
      }
    })
  }, [])

  return (
    <div className="home-bg">
      {/* Hero Section */}
      <section className="container-fluid home-hero d-flex align-items-center justify-content-center flex-column text-center position-relative">
        <div className="home-hero-overlay" />
        {/* <img
          src="/public/hero-pokemon-cards.png"
          alt="Pokemon Cards"
          className="home-hero-img"
        /> */}
        <div className="home-hero-content position-absolute top-50 start-50 translate-middle text-white">
          <h1 className="display-4 fw-bold mb-3">Track Your Pokemon Card Collection</h1>
          <p className="lead mb-4">
            Pokeport is a fresh way to view card prices and track your collection progress.<br />
            Organize, manage, and showcase your Pokemon cards all in one place.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
            {/* <button className="btn btn-danger btn-lg px-4">Start Tracking</button> */}
            <button
              className="btn btn-outline-light btn-lg px-4"
              onClick={() => navigate('/sets')}
            >
              Explore Card Sets
            </button>
          </div>
        </div>
      </section>

      {/* Popular Card Sets */}
      <section className="container my-5 popular-sets-bottom-spacer">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="popular-sets-header">Popular Card Sets</h2>
        </div>
        <div className="row g-4">
          {popularSets.map(set => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={set.id}>
              <div className="card shadow-lg position-relative h-100 popular-set-card d-flex flex-column align-items-stretch bg-transparent border-0">
                <div className="position-relative popular-set-img-wrapper">
                  <img
                    src={
                      setImages[set.id] ||
                      'https://assets.pokemon.com/assets/cms2/img/cards/web/SM1/SM1_EN_1.png'
                    }
                    alt={set.name}
                    className="card-img-top popular-set-img"
                  />
                  <div className="popular-set-img-overlay"></div>
                  <div className="popular-set-title position-absolute bottom-0 start-0 w-100 text-white px-3 py-2">
                    <span className="fw-bold">{set.name}</span>
                  </div>
                </div>
                <div className="card-body py-3 d-flex flex-column align-items-start justify-content-end">
                  <div className="popular-set-details mb-2">
                    <span className="popular-set-detail-label">Cards in set:</span> {set.cardCount}
                  </div>
                  <span className="badge bg-success popular-set-date align-self-start">
                    Release date: {set.releaseDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-dark btn-lg px-5">View All Card Sets</button>
        </div> */}
      </section>
    </div>
  )
}