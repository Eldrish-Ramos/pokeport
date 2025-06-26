import { useEffect, useState, useRef } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import { Toast, ToastContainer } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './PokeSets.css'
import pokeball from '../assets/pokeball.png'
import { useMutation, gql, useQuery } from '@apollo/client'

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
  set?: {
    name: string
    id: string
    images?: {
      symbol: string
      logo: string
    }
  }
  artist?: string // <-- Add this line
}

type SortOrder = 'none' | 'asc' | 'desc'

const API_KEY = import.meta.env.VITE_POKEMONTCG_API_KEY

const sortOptions = [
  { value: 'none', label: 'None' },
  { value: 'asc', label: 'Price: Low to High' },
  { value: 'desc', label: 'Price: High to Low' }
]

const ADD_TO_COLLECTION = gql`
  mutation AddToCollection($cardId: String!, $setId: String!) {
    addToCollection(cardId: $cardId, setId: $setId) {
      collection {
        cardId
        setId
      }
    }
  }
`
const ME_QUERY = gql`
  query Me {
    me {
      collection {
        cardId
        setId
      }
    }
  }
`

export default function PokeSets() {
  const [sets, setSets] = useState<Set[]>([])
  const [selectedSet, setSelectedSet] = useState<Set | null>(null)
  const [loadingSets, setLoadingSets] = useState(false)
  const [cards, setCards] = useState<Card[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')
  const [searchCards, setSearchCards] = useState<Card[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [setSelectValue, setSetSelectValue] = useState<{ value: string; label: string } | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [showAll, setShowAll] = useState(true)
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  const { data: meData } = useQuery(ME_QUERY)
  const userCollection = meData?.me?.collection ?? []

  // Helper to check if card is in collection for this set
  function isCardInCollection(cardId: string, setId: string) {
    return userCollection.some((entry: { cardId: string; setId: string }) =>
      entry.cardId === cardId && entry.setId === setId
    )
  }

  const [addToCollection] = useMutation(ADD_TO_COLLECTION, {
    refetchQueries: [{ query: ME_QUERY }],
  })

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
      fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${selectedSet.id}`, {
        headers: {
          'X-Api-Key': API_KEY,
        },
      })
        .then(res => res.json())
        .then(data => {
          setCards(data.data)
        })
        .catch(() => {})
    } else {
      setCards([])
    }
  }, [selectedSet])

  const options = sets.map(set => ({
    value: set.id,
    label: `${set.name} (${set.series})`,
  }))

  const handleChange = (option: { value: string; label: string } | null) => {
    if (option) {
      const found = sets.find(set => set.id === option.value) || null
      setSelectedSet(found)
    } else {
      setSelectedSet(null)
    }
    setSetSelectValue(option)
    setSearchCards(null)
    setSearchError(null)
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

  // --- SEARCH BAR LOGIC ---
  // Load options for AsyncSelect (live search)
  const loadPokemonOptions = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 1) {
      return []
    }
    setSearchError(null)
    setSearchLoading(true)
    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(inputValue)}*&pageSize=10`,
        {
          headers: {
            'X-Api-Key': API_KEY,
          },
        }
      )
      const data = await res.json()
      // Remove duplicates by name (for autoguess)
      const seen = new Set<string>()
      const options = data.data
        .filter((card: Card) => {
          if (seen.has(card.name)) return false
          seen.add(card.name)
          return true
        })
        .map((card: Card) => ({
          value: card.name,
          label: card.name,
        }))
      return options
    } catch (e) {
      setSearchError('Failed to load suggestions')
      return []
    } finally {
      setSearchLoading(false)
    }
  }

  // When a pokemon is selected, fetch all cards with that name
  const handlePokemonSearch = async (option: { value: string; label: string } | null) => {
    if (!option) {
      setSearchCards(null)
      setSearchError(null)
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    setSelectedSet(null)
    setSetSelectValue(null)
    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(option.value)}"&pageSize=250`,
        {
          headers: {
            'X-Api-Key': API_KEY,
          },
        }
      )
      const data = await res.json()
      setSearchCards(data.data)
    } catch (e) {
      setSearchError('Failed to fetch cards for this Pokémon')
      setSearchCards([])
    } finally {
      setSearchLoading(false)
    }
  }
  const cardsToDisplay = searchCards ?? sortedCards

  const isLoggedIn = !!meData?.me

  const handleAddToCollection = async (cardId: string, setId: string) => {
    try {
      await addToCollection({ variables: { cardId, setId } })
      setShowToast(true)
      // Hide toast after 2 seconds
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
      toastTimeout.current = setTimeout(() => setShowToast(false), 2000)
    } catch (e) {
      // Optionally handle error
    }
  }

  const filteredCards = showAll
    ? cardsToDisplay
    : cardsToDisplay.filter(card =>
        !isCardInCollection(card.id, card.set?.id || '')
      )

  // Close zoom on scroll
  useEffect(() => {
    if (!zoomedCardId) return
    const handleScroll = () => setZoomedCardId(null)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [zoomedCardId])

  // Close zoom on Escape key
  useEffect(() => {
    if (!zoomedCardId) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedCardId(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [zoomedCardId])

  // --- Dummy usage to satisfy TS "declared but never read" rule ---
  if (false) {
    // These lines will never run, but will satisfy the TS compiler
    console.log(searchLoading, setSearchLoading, searchError, loadPokemonOptions, handlePokemonSearch)
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
          <AsyncSelect
            cacheOptions
            loadOptions={loadPokemonOptions}
            defaultOptions={false}
            isClearable
            isLoading={searchLoading}
            placeholder="Search Pokémon by name..."
            onChange={handlePokemonSearch}
            classNamePrefix="pokesets-select"
            styles={{
              menu: (base: any) => ({ ...base, zIndex: 9999 }),
              container: (base: any) => ({ ...base, marginBottom: '1.2em' }),
            }}
          />
          {searchError && (
            <div className="alert alert-danger py-1 px-2 my-2" style={{ fontSize: '0.97em' }}>
              {searchError}
            </div>
          )}
          <Select
            id="set-select"
            isClearable
            isLoading={loadingSets}
            options={options}
            onChange={handleChange}
            value={setSelectValue}
            placeholder="Type to search..."
            classNamePrefix="pokesets-select"
          />
          {selectedSet && (
            <>
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
              {/* --- MOVE TOGGLE HERE --- */}
              <div className="pokesets-radio-toggle mt-3 mb-2">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="showCards"
                    checked={showAll}
                    onChange={() => setShowAll(true)}
                  />
                  <span className="custom-radio"></span>
                  Show All
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="showCards"
                    checked={!showAll}
                    onChange={() => setShowAll(false)}
                  />
                  <span className="custom-radio"></span>
                  Not Collected
                </label>
              </div>
              {/* --- AMP info below --- */}
              <div className="pokesets-info-section">
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
        <div className="pokesets-set-banner card shadow-sm border-0 mb-4 d-flex flex-row align-items-center justify-content-center px-4 py-4 flex-wrap" style={{ minHeight: '180px' }}>
          {/* Only show logo if a set is selected AND not searching */}
          {selectedSet && selectedSet.images?.logo && !searchCards ? (
            <img
              src={selectedSet.images.logo}
              alt={`${selectedSet.name} logo`}
              className="pokesets-set-banner-logo"
              style={{
                width: 'min(90vw, 420px)',
                height: 'auto',
                maxHeight: '180px',
                display: 'block',
                margin: '0 auto',
                objectFit: 'contain',
                background: 'transparent',
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0,
                padding: 0,
              }}
            />
          ) : (
            // Optionally, show nothing or a placeholder when no set is selected
            null
          )}
        </div>
        {searchLoading && <div className="text-secondary mb-3">Loading cards...</div>}
        {!searchLoading && cardsToDisplay.length === 0 && (selectedSet || searchCards) && (
          <div className="text-muted mb-3">No cards found for this search.</div>
        )}
        {searchError && (
          <div className="alert alert-danger py-1 px-2 my-2" style={{ fontSize: '0.97em' }}>
            {searchError}
          </div>
        )}
        <ToastContainer
          position="top-center"
          className="poke-toast-container"
          style={{
            position: 'fixed',
            top: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: 320,
            pointerEvents: 'none'
          }}
        >
          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            bg="success"
            delay={2000}
            autohide
            style={{
              pointerEvents: 'auto',
              borderRadius: '1em',
              boxShadow: '0 4px 24px #0007',
              background: 'var(--theme-accent)',
              color: 'var(--theme-text)',
              fontWeight: 600,
              fontSize: '1.1em'
            }}
          >
            <Toast.Body className="text-white fw-bold text-center">
              Card added to your collection
            </Toast.Body>
          </Toast>
        </ToastContainer>
        <div className="row g-4 flex-grow-1">
          {filteredCards.map(card => {
            let price: number | undefined = getCardPrice(card)
            const inCollection = isCardInCollection(card.id, card.set?.id || '')
            return (
              <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={card.id}>
                <div className="card border-0 shadow pokesets-card h-100 d-flex flex-column align-items-stretch position-relative">
                  <div className="pokesets-card-img-wrapper position-relative">
                    <img
                      src={card.images.large || card.images.small}
                      alt={card.name}
                      className="pokesets-card-img"
                      style={{ cursor: 'zoom-in' }}
                      onClick={() => setZoomedCardId(card.id)}
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
                  {card.set && (
                    <div className="text-center mt-1" style={{ fontSize: '0.9em', color: '#bbb' }}>
                      <span>{card.set.name}</span>
                    </div>
                  )}
                  {isLoggedIn && !inCollection && (
                    <button
                      className="add-to-collection-btn"
                      title="Add to Collection"
                      onClick={() => handleAddToCollection(card.id, card.set?.id || '')}
                    >
                      <span className="plus-icon">+</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Zoomed card overlay (outside the grid) */}
        {zoomedCardId && (() => {
          const zoomedCard = filteredCards.find(card => card.id === zoomedCardId)
          if (!zoomedCard) return null
          return (
            <div
              className="card-zoom-overlay"
              onClick={() => setZoomedCardId(null)}
              style={{ zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div
                className="card-zoom-modal"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  background: 'transparent',
                  maxWidth: '1200px',
                  maxHeight: '92vh',
                  width: '98vw',
                  padding: '2vw',
                }}
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={zoomedCard.images.large || zoomedCard.images.small}
                  alt={zoomedCard.name}
                  className="card-zoom-img"
                  style={{
                    maxWidth: '420px',
                    maxHeight: '85vh',
                    borderRadius: '1.5em',
                    marginRight: '3vw',
                    background: 'transparent',
                    boxShadow: '0 8px 48px #000b, 0 1.5px 6px #0006',
                    border: '4px solid var(--theme-accent2)',
                    transition: 'box-shadow 0.2s, border 0.2s',
                  }}
                />
                <aside
                  className="card-zoom-sidebar"
                  style={{
                    background: 'var(--theme-card-bg)',
                    color: 'var(--theme-text)',
                    borderRadius: '1.5em',
                    boxShadow: '0 8px 32px #000a',
                    minWidth: '320px',
                    maxWidth: '420px',
                    padding: '2.5em 2em 2.5em 2em',
                    marginLeft: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5em',
                    zIndex: 20001,
                    borderLeft: '10px solid var(--theme-accent)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div className="card-zoom-sidebar-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1em',
                    marginBottom: '1em'
                  }}>
                    {zoomedCard.set?.images?.symbol && (
                      <img
                        src={zoomedCard.set.images.symbol}
                        alt="Set symbol"
                        style={{
                          width: 48,
                          height: 48,
                          background: 'var(--theme-accent3)',
                          borderRadius: '50%',
                          border: '3px solid var(--theme-accent2)',
                          boxShadow: '0 2px 8px #0003',
                        }}
                      />
                    )}
                    <h3 style={{
                      fontWeight: 900,
                      fontSize: '1.5em',
                      margin: 0,
                      color: 'var(--theme-accent)',
                      letterSpacing: '1px',
                      textShadow: '0 2px 8px #0008'
                    }}>{zoomedCard.name}</h3>
                  </div>
                  <div className="card-zoom-sidebar-detail">
                    <span className="sidebar-label">Set:</span>
                    <span>{zoomedCard.set?.name || 'Unknown'}</span>
                  </div>
                  <div className="card-zoom-sidebar-detail">
                    <span className="sidebar-label">Artist:</span>
                    <span>{zoomedCard.artist || 'Unknown'}</span>
                  </div>
                  {zoomedCard.subtypes && zoomedCard.subtypes.length > 0 && (
                    <div className="card-zoom-sidebar-detail">
                      <span className="sidebar-label">Subtypes:</span>
                      <span>{zoomedCard.subtypes.join(', ')}</span>
                    </div>
                  )}
                  <button
                    className="btn btn-danger mt-3"
                    onClick={() => setZoomedCardId(null)}
                    style={{
                      alignSelf: 'flex-end',
                      borderRadius: '2em',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      padding: '0.6em 2em',
                      background: 'var(--theme-accent)',
                      color: 'var(--theme-accent-text, #fff)',
                      border: 'none',
                      boxShadow: '0 2px 8px #0004',
                      marginTop: 'auto',
                      fontSize: '1.15em',
                    }}
                  >
                    Close
                  </button>
                  <div className="sidebar-bg-accent" />
                </aside>
              </div>
            </div>
          )
        })()}
      </main>
    </div>
  )
}