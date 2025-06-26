import { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import './Artist.css'
import './Collection.css'
import pokeball from '../assets/pokeball.png'

const ARTIST_INFO: Record<string, { image: string; bio: string }> = {
  "Mitsuhiro Arita": {
    image: "https://archives.bulbagarden.net/media/upload/9/9e/Mitsuhiro_Arita.jpg",
    bio: "Mitsuhiro Arita is a renowned Japanese illustrator best known for his iconic Pokémon card artwork, including the original Charizard. He has contributed to the Pokémon TCG since its inception."
  },
  "Ken Sugimori": {
    image: "https://archives.bulbagarden.net/media/upload/3/3b/Ken_Sugimori.jpg",
    bio: "Ken Sugimori is the art director for the Pokémon franchise and designed many of the original Pokémon. His artwork is foundational to the Pokémon world."
  },
  // Add more artists as needed
}

const API_KEY = import.meta.env.VITE_POKEMONTCG_API_KEY

type Card = {
  id: string
  name: string
  images: { small: string; large: string }
  set?: {
    name: string
    id: string
    images?: { symbol: string; logo: string }
  }
  artist?: string
  subtypes?: string[]
  [key: string]: any
}

type ArtistOption = { value: string; label: string }
type CardType = Card

export default function Artist() {
  const [artistOptions, setArtistOptions] = useState<ArtistOption[]>([])
  const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null)
  const [artistCards, setArtistCards] = useState<Card[]>([])
  const [loadingCards, setLoadingCards] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null)

  // Fetch all unique artists for autocomplete
  const loadArtistOptions = async (inputValue: string) => {
    if (!inputValue || inputValue.length < 1) return []
    setSearchError(null)
    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=artist:${encodeURIComponent(inputValue)}*&pageSize=50`,
        { headers: { 'X-Api-Key': API_KEY } }
      )
      const data = await res.json()
      const seen = new Set<string>()
      const options = data.data
        .filter((card: Card) => {
          if (!card.artist) return false
          if (seen.has(card.artist)) return false
          seen.add(card.artist)
          return true
        })
        .map((card: Card) => ({
          value: card.artist,
          label: card.artist,
        }))
      return options
    } catch {
      setSearchError('Failed to load artist suggestions')
      return []
    }
  }

  // When an artist is selected, fetch all their cards
  const handleArtistSelect = async (option: ArtistOption | null) => {
    setSelectedArtist(option)
    setArtistCards([])
    setSearchError(null)
    if (!option) return
    setLoadingCards(true)
    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=artist:"${encodeURIComponent(option.value)}"&pageSize=250`,
        { headers: { 'X-Api-Key': API_KEY } }
      )
      const data = await res.json()
      setArtistCards(data.data)
    } catch {
      setSearchError('Failed to fetch cards for this artist')
      setArtistCards([])
    } finally {
      setLoadingCards(false)
    }
  }

  // Optionally, preload some popular artists for initial suggestions
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?pageSize=50`,
        { headers: { 'X-Api-Key': API_KEY } }
      )
      const data = await res.json()
      const seen = new Set<string>()
      const options = data.data
        .filter((card: Card) => {
          if (!card.artist) return false
          if (seen.has(card.artist)) return false
          seen.add(card.artist)
          return true
        })
        .map((card: Card) => ({
          value: card.artist,
          label: card.artist,
        }))
      setArtistOptions(options)
    })()
  }, [])

  const artistInfo = selectedArtist ? ARTIST_INFO[selectedArtist.value] : null

  // Zoom overlay (Collection style, no sidebar)
  const zoomOverlay = zoomedCard && (
    <div
      className="card-zoom-overlay"
      onClick={() => setZoomedCard(null)}
      style={{
        zIndex: 20000,
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(20, 20, 20, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out'
      }}
    >
      <img
        src={zoomedCard.images.large || zoomedCard.images.small}
        alt={zoomedCard.name}
        className="card-zoom-img"
        style={{
          maxWidth: '420px',
          maxHeight: '85vh',
          borderRadius: '1.5em',
          border: '4px solid var(--theme-accent2)',
          boxShadow: '0 8px 48px #000b, 0 1.5px 6px #0006',
          background: 'transparent'
        }}
        onClick={e => e.stopPropagation()}
      />
    </div>
  )

  return (
    <div className="collection-bg d-flex min-vh-100">
      {/* Sidebar */}
      <aside className="collection-sidebar d-flex flex-column p-0">
        <div className="collection-sidebar-header d-flex flex-column align-items-start justify-content-start w-100 p-4 pb-2 shadow-sm">
          <h4 className="mb-3 fw-bold d-flex align-items-center">
            <img
              src={pokeball}
              alt="Pokeball"
              style={{ height: '1.3em', width: '1.3em', marginRight: '0.4em' }}
            />
            Pokémon Card Artists
          </h4>
        </div>
        <div className="collection-sidebar-content flex-grow-1 d-flex flex-column">
          <AsyncSelect
            cacheOptions
            loadOptions={loadArtistOptions}
            defaultOptions={artistOptions}
            isClearable
            placeholder="Search for an artist..."
            onChange={handleArtistSelect}
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
        </div>
      </aside>
      {/* Main content */}
      <main className="collection-main flex-grow-1 d-flex flex-column">
        <div className="container py-5">
          {selectedArtist && (
            <div className="artist-info-card card shadow-sm border-0 mb-5 p-4 d-flex flex-row align-items-center"
              style={{
                background: 'var(--theme-card-bg)',
                width: '100%',
                maxWidth: '100%',
                borderRadius: '1.2rem',
              }}
            >
              {artistInfo?.image && (
                <img
                  src={artistInfo.image}
                  alt={selectedArtist.value}
                  className="artist-photo"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: 32,
                    border: '4px solid var(--theme-accent2)',
                    boxShadow: '0 2px 12px #0004',
                    background: 'var(--theme-accent3)'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h2
                  className="fw-bold mb-2"
                  style={{
                    color: 'var(--theme-accent)',
                    fontSize: '2.1em',
                    letterSpacing: '1px',
                    textShadow: '0 2px 8px #0008',
                    fontFamily: 'inherit',
                    marginBottom: '0.2em',
                    textAlign: 'center'
                  }}
                >
                  Works by <span style={{
                    color: 'var(--theme-accent2)',
                    fontWeight: 900,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontSize: '0.85em',
                    textShadow: '0 1px 4px #0006'
                  }}>{selectedArtist.value}</span>
                </h2>
                <div style={{ color: 'var(--theme-text)', fontSize: '1.1em', textAlign: 'center' }}>
                  {artistInfo?.bio || ""}
                </div>
              </div>
            </div>
          )}
          {selectedArtist && (
            <>
              <hr className="my-4" />
              {loadingCards ? (
                <div className="text-secondary mb-3">Loading cards...</div>
              ) : artistCards.length === 0 ? (
                <div className="text-muted mb-3">No cards found for this artist.</div>
              ) : (
                <div className="row g-4">
                  {artistCards.map(card => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={card.id}>
                      <div className="collection-card card h-100 shadow-sm border-0 position-relative">
                        <img
                          src={card.images.large || card.images.small}
                          alt={card.name}
                          className="collection-card-img card-img-top"
                          style={{ cursor: 'zoom-in' }}
                          onClick={() => setZoomedCard(card)}
                        />
                        <div className="collection-card-body card-body p-3 d-flex flex-column align-items-center">
                          <div className="collection-card-title fw-bold mb-2">{card.name}</div>
                          <div className="collection-card-set badge mb-1">
                            {card.set?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {zoomOverlay}
      </main>
    </div>
  )
}