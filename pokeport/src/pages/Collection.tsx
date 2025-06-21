import { useQuery, gql, useMutation } from '@apollo/client'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { Toast, ToastContainer } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Collection.css'

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

const REMOVE_FROM_COLLECTION = gql`
  mutation RemoveFromCollection($cardId: String!, $setId: String!) {
    removeFromCollection(cardId: $cardId, setId: $setId) {
      collection {
        cardId
        setId
      }
    }
  }
`

type SetInfo = {
  id: string
  name: string
  printedTotal: number
}

export default function Collection() {
  const { data, loading } = useQuery(ME_QUERY)
  const [cards, setCards] = useState<any[]>([])
  const [selectedSet, setSelectedSet] = useState<string | null>(null)
  const [sets, setSets] = useState<SetInfo[]>([])
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null)
  const navigate = useNavigate()
  const [removeFromCollection] = useMutation(REMOVE_FROM_COLLECTION, {
    refetchQueries: [{ query: ME_QUERY }],
  })

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  const isLoggedIn = !!data?.me

  // Fetch all sets for sidebar progress
  useEffect(() => {
    fetch('https://api.pokemontcg.io/v2/sets', {
      headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_TCGAPI_KEY }
    })
      .then(res => res.json())
      .then(res => setSets(res.data || []))
  }, [])

  // Get unique set options from collection
  const setOptions = data?.me?.collection
    ? Array.from(
        new Set(data.me.collection.map((entry: { setId: string }) => entry.setId))
      ).map(setId => {
        const set = sets.find(s => s.id === setId)
        return {
          value: setId,
          label: set?.name || setId,
        }
      })
    : []

  // Get set info for selected set
  useEffect(() => {
    if (selectedSet && sets.length) {
      setSetInfo(sets.find(s => s.id === selectedSet) || null)
    } else {
      setSetInfo(null)
    }
  }, [selectedSet, sets])

  useEffect(() => {
    if (isLoggedIn && data.me.collection?.length) {
      const filtered = selectedSet
        ? data.me.collection.filter((entry: { setId: string }) => entry.setId === selectedSet)
        : data.me.collection

      if (filtered.length === 0) {
        setCards([])
        return
      }

      // Batch fetch all cards by IDs
      const ids = filtered.map((entry: { cardId: string }) => entry.cardId)
      const query = ids.map((id: string) => `id:${id}`).join(' OR ')
      fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`, {
        headers: { 'X-Api-Key': import.meta.env.VITE_POKEMON_TCGAPI_KEY }
      })
        .then(res => res.json())
        .then(res => {
          // Optionally filter by setId if needed
          const cardsArr = res.data?.filter((card: any) =>
            filtered.some((entry: { cardId: string; setId: string }) =>
              entry.cardId === card.id && entry.setId === card.set.id
            )
          ) || []
          setCards(cardsArr)
        })
        .catch(() => setCards([]))
    } else {
      setCards([])
    }
  }, [data, isLoggedIn, selectedSet])

  // Progress calculation
  let progress = 0
  let collected = 0
  let total = 0
  if (selectedSet && setInfo) {
    collected = data?.me?.collection?.filter((entry: { setId: string }) => entry.setId === selectedSet).length || 0
    total = setInfo.printedTotal || 0
    progress = total ? Math.round((collected / total) * 100 * 100) / 100 : 0 // round to 2 decimal places
  }

  if (loading) return <div className="text-light">Loading your collection...</div>

  if (!isLoggedIn) {
    return (
      <section className="collection-hero d-flex align-items-center justify-content-center flex-column text-center position-relative">
        <div className="collection-hero-overlay" />
        <div className="collection-hero-content position-absolute top-50 start-50 translate-middle text-white">
          <h1 className="display-4 fw-bold mb-3">Track Your Pokemon Card Collection</h1>
          <p className="lead mb-4">
            Sign in or register to start tracking your collection and see your cards here!
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
            <button
              className="btn btn-danger btn-lg px-4"
              onClick={() => navigate('/login')}
            >
              Sign in or Register!
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Remove handler with toast
  const handleRemove = async (cardId: string, setId: string) => {
    try {
      await removeFromCollection({ variables: { cardId, setId } })
      setToastMsg('Card removed from your collection')
      setShowToast(true)
      if (toastTimeout.current) clearTimeout(toastTimeout.current)
      toastTimeout.current = setTimeout(() => setShowToast(false), 2000)
    } catch {}
  }

  return (
    <div className="collection-bg d-flex min-vh-100">
      {/* Sidebar */}
      <aside className="collection-sidebar d-flex flex-column p-0">
        <div className="collection-sidebar-header d-flex flex-column align-items-start justify-content-start w-100 p-4 pb-2 shadow-sm">
          <h4 className="mb-3 fw-bold d-flex align-items-center">
            <span className="collection-title-icon" style={{ fontSize: '1.3em', marginRight: '0.4em' }}>📦</span>
            Collection Sets
          </h4>
        </div>
        <div className="collection-sidebar-content flex-grow-1 d-flex flex-column">
          <Select
            id="set-select"
            isClearable
            options={setOptions}
            onChange={opt => setSelectedSet(opt && typeof opt.value === 'string' ? opt.value : null)}
            value={
              selectedSet
                ? setOptions.find(opt => opt.value === selectedSet)
                : null
            }
            placeholder="Select a set..."
            classNamePrefix="collection-select"
          />
          {/* Progress Bar */}
          {selectedSet && setInfo && (
            <div className="collection-progress-card card p-3 mt-4 shadow-sm border-0 d-flex flex-column align-items-center">
              <div className="collection-progress-circle">
                <svg width="150" height="150">
                  <circle
                    className="collection-progress-bg"
                    cx="75"
                    cy="75"
                    r="65"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    className="collection-progress-bar"
                    cx="75"
                    cy="75"
                    r="65"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 65}
                    strokeDashoffset={2 * Math.PI * 65 * (1 - progress / 100)}
                  />
                  <text
                    x="75"
                    y="80"
                    textAnchor="middle"
                    fontSize="1.75em"
                    fill="var(--theme-accent)"
                    fontWeight="bold"
                    dominantBaseline="middle"
                  >
                    {progress}%
                  </text>
                </svg>
              </div>
              <div className="collection-progress-label mt-2 text-center">
                <span>
                  Your <b>{setInfo.name}</b> collection is <b>{progress}%</b> complete!
                </span>
                <br />
                <span style={{ fontSize: '0.95em', color: 'var(--theme-accent2)' }}>
                  {collected} / {total} cards collected
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="collection-main flex-grow-1 d-flex flex-column">
        <div className="container py-5">
          <div className="collection-header card shadow-sm border-0 px-4 py-3 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
            <h2 className="collection-title fw-bold mb-3 mb-md-0">
              <span className="collection-title-icon">📦</span>
              My Collection
            </h2>
            <div className="collection-filter-select">
              <Select
                options={[
                  { value: '', label: 'All Sets' },
                  ...setOptions
                ]}
                value={
                  selectedSet
                    ? setOptions.find(opt => opt.value === selectedSet)
                    : { value: '', label: 'All Sets' }
                }
                onChange={opt => setSelectedSet(opt && typeof opt.value === 'string' ? opt.value : null)}
                isClearable={false}
                placeholder="Filter by Set"
                classNamePrefix="collection-select"
              />
            </div>
          </div>
          {cards.length === 0 && (
            <div className="text-light text-center py-5">
              No cards in your collection{selectedSet ? ' for this set' : ''} yet.
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
              bg="danger"
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
                {toastMsg}
              </Toast.Body>
            </Toast>
          </ToastContainer>
          <div className="row g-4">
            {cards.map(card => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={card.id}>
                <div className="collection-card card h-100 shadow-sm border-0 position-relative">
                  <img
                    src={card.images.large || card.images.small}
                    alt={card.name}
                    className="collection-card-img card-img-top"
                  />
                  <div className="collection-card-body card-body p-3 d-flex flex-column align-items-center">
                    <div className="collection-card-title fw-bold mb-2">{card.name}</div>
                    <div className="collection-card-set badge mb-1">
                      {card.set?.name}
                    </div>
                  </div>
                  <button
                    className="remove-from-collection-btn"
                    title="Remove from Collection"
                    onClick={() => handleRemove(card.id, card.set?.id)}
                  >
                    <span className="minus-icon">−</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}