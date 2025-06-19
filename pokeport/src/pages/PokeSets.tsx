import { useEffect, useState } from 'react'
import Select from 'react-select'
import 'bootstrap/dist/css/bootstrap.min.css'
import './PokeSets.css'
import pokeball from '../assets/pokeball.png'

type Set = {
  id: string
  name: string
  series: string
  releaseDate: string
  printedTotal: number
}

type Card = {
  id: string
  name: string
  images: { small: string; large: string }
  supertype: string
  subtypes?: string[]
}

const API_KEY = import.meta.env.VITE_POKEMONTCG_API_KEY

export default function PokeSets() {
  const [sets, setSets] = useState<Set[]>([])
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [loadingSets, setLoadingSets] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [loadingCards, setLoadingCards] = useState(false)

  useEffect(() => {
    setLoadingSets(true)
    fetch('https://api.pokemontcg.io/v2/sets', {
      headers: {
        'X-Api-Key': API_KEY,
      },
    })
      .then(res => res.json())
      .then(data => {
        setSets(data.data)
        setLoadingSets(false)
      })
      .catch(() => setLoadingSets(false))
  }, [])

  useEffect(() => {
    if (selectedSet) {
      setLoadingCards(true)
      fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${selectedSet.id}`, {
        headers: {
          'X-Api-Key': API_KEY,
        },
      })
        .then(res => res.json())
        .then(data => {
          setCards(data.data)
          setLoadingCards(false)
        })
        .catch(() => setLoadingCards(false))
    } else {
      setCards([])
    }
  }, [selectedSet])

  const options = sets.map(set => ({
    value: set.id,
    label: `${set.name} (${set.series})`,
  }))

  const handleChange = (option: { value: string } | null) => {
    if (option) {
      const found = sets.find(set => set.id === option.value) || null
      setSelectedSet(found)
    } else {
      setSelectedSet(null)
    }
  }

  return (
    <div className="pokesets-bg d-flex min-vh-100">
      {/* Sidebar */}
      <aside className="pokesets-sidebar d-flex flex-column p-0">
        <div className="pokesets-sidebar-header d-flex flex-column align-items-start justify-content-start w-100 p-4 pb-2 shadow-sm">
          <h4 className="mb-3 fw-bold d-flex align-items-center">
            <img
              src={pokeball}
              alt="Pokeball"
              style={{ height: '1.3em', width: '1.3em', marginRight: '0.4em' }}
            />
            Browse Sets
          </h4>
        </div>
        <div className="pokesets-sidebar-content flex-grow-1 d-flex flex-column">
          <Select
            id="set-select"
            isClearable
            isLoading={loadingSets}
            options={options}
            onChange={handleChange}
            placeholder="Type to search..."
            classNamePrefix="pokesets-select"
          />
          {selectedSet && (
            <div className="card p-3 mt-4 shadow-sm border-0 pokesets-set-info">
              <h6 className="mb-2 text-danger">{selectedSet.name}</h6>
              <p className="mb-1 text-light">
                <strong>Series:</strong> {selectedSet.series}
                <br />
                <strong>Release Date:</strong> {selectedSet.releaseDate}
                <br />
                <strong>Total Cards:</strong> {selectedSet.printedTotal}
              </p>
            </div>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="pokesets-main flex-grow-1 d-flex flex-column">
        <h4 className="mb-4 pokesets-main-title">
          {selectedSet
            ? `Cards in "${selectedSet.name}"`
            : 'Select a set to view cards'}
        </h4>
        {loadingCards && <div className="text-secondary mb-3">Loading cards...</div>}
        {!loadingCards && cards.length === 0 && selectedSet && (
          <div className="text-muted mb-3">No cards found for this set.</div>
        )}
        <div className="row g-4 flex-grow-1 overflow-auto">
          {cards.map(card => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={card.id}>
              <div className="card border-0 shadow pokesets-card h-100 d-flex flex-column align-items-stretch">
                <div className="pokesets-card-img-wrapper">
                  <img
                    src={card.images.large || card.images.small}
                    alt={card.name}
                    className="pokesets-card-img"
                  />
                </div>
                <div className="text-center mt-2 pokesets-card-title">
                  {card.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}