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
  images?: {
    symbol: string
    logo: string
  }
}

type Card = {
  id: string
  name: string
  images: { small: string; large: string }
  supertype: string
  subtypes?: string[]
  tcgplayer?: {
    prices?: {
      normal?: { market?: number }
      holofoil?: { market?: number }
      reverseHolofoil?: { market?: number }
    }
  }
  cardmarket?: {
    prices?: {
      averageSellPrice?: number
    }
  }
}

type SortOrder = 'none' | 'asc' | 'desc'

const API_KEY = import.meta.env.VITE_POKEMONTCG_API_KEY

const sortOptions = [
  { value: 'none', label: 'None' },
  { value: 'asc', label: 'Price: Low to High' },
  { value: 'desc', label: 'Price: High to Low' }
]

export default function PokeSets() {
  const [sets, setSets] = useState<Set[]>([])
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [loadingSets, setLoadingSets] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')

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

  // Helper to get the price for sorting
  function getCardPrice(card: Card): number | undefined {
    if (card.tcgplayer?.prices?.normal?.market) {
      return card.tcgplayer.prices.normal.market
    } else if (card.tcgplayer?.prices?.holofoil?.market) {
      return card.tcgplayer.prices.holofoil.market
    } else if (card.tcgplayer?.prices?.reverseHolofoil?.market) {
      return card.tcgplayer.prices.reverseHolofoil.market
    } else if (card.cardmarket?.prices?.averageSellPrice) {
      return card.cardmarket.prices.averageSellPrice
    }
    return undefined
  }

  // Sort cards based on sortOrder
  const sortedCards = [...cards]
  if (sortOrder !== 'none') {
    sortedCards.sort((a, b) => {
      const priceA = getCardPrice(a)
      const priceB = getCardPrice(b)
      if (priceA === undefined && priceB === undefined) return 0
      if (priceA === undefined) return 1
      if (priceB === undefined) return -1
      return sortOrder === 'asc'
        ? priceA - priceB
        : priceB - priceA
    })
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
          {/* Filter Section */}
          {selectedSet && (
            <>
              <div className="card p-3 mt-2 shadow-sm border-0 pokesets-filter-section">
                <h6 className="mb-2 text-light">Filter & Sort</h6>
                <div className="mb-2">
                  <label className="form-label text-light fw-semibold mb-1" htmlFor="sort-select">
                    Sort by Price
                  </label>
                  <Select
                    id="sort-select"
                    options={sortOptions}
                    value={sortOptions.find(opt => opt.value === sortOrder)}
                    onChange={opt => setSortOrder((opt?.value ?? 'none') as SortOrder)}
                    classNamePrefix="pokesets-select"
                    isSearchable={false}
                    menuPlacement="auto"
                  />
                </div>
              </div>
              {/* Info Section */}
              <div className="pokesets-info-section mt-3 mb-2">
                <em>
                  *AMP stands for AVERAGE MARKET PRICE - data is collected on sales from TCGPlayer taking into account lowest sold prices and highest sold prices. AMP is based off that data and assumes the card in question is in lightly used condition (good condition). If your card has suffered wear and tear, your sale price may heavily vary!
                </em>
              </div>
            </>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="pokesets-main flex-grow-1 d-flex flex-column">
        <div className="pokesets-set-banner card shadow-sm border-0 mb-4 d-flex flex-row align-items-center justify-content-center px-4 py-4">
          {selectedSet && selectedSet.images?.logo ? (
            <img
              src={selectedSet.images.logo}
              alt={`${selectedSet.name} logo`}
              className="pokesets-set-banner-logo me-3"
            />
          ) : (
            <img
              src={pokeball}
              alt="Pokeball"
              className="pokesets-set-banner-icon me-3"
              style={{ width: '2.8em', height: '2.8em' }}
            />
          )}
          <div className="text-center w-100">
            <div className="pokesets-set-banner-title fw-bold">
              {selectedSet
                ? <>Cards in <span className="text-danger">"{selectedSet.name}"</span></>
                : <>Select a set to view cards</>
              }
            </div>
          </div>
        </div>
        {loadingCards && <div className="text-secondary mb-3">Loading cards...</div>}
        {!loadingCards && sortedCards.length === 0 && selectedSet && (
          <div className="text-muted mb-3">No cards found for this set.</div>
        )}
        <div className="row g-4 flex-grow-1">
          {sortedCards.map(card => {
            let price: number | undefined = getCardPrice(card)
            return (
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
                  <div className="text-center mt-1">
                    {price !== undefined ? (
                      <span className="pokesets-card-price">AMP: ${price.toFixed(2)}</span>
                    ) : (
                      <span className="pokesets-card-price pokesets-card-price-unavailable">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}