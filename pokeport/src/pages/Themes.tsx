import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import './Themes.css'

const API_KEY = import.meta.env.VITE_POKEMON_TCGAPI_KEY || import.meta.env.VITE_POKEMONTCG_API_KEY

const TYPE_COLORS: Record<string, string> = {
  default: '#ef5350',
  Colorless: '#A8A77A',
  Darkness: '#705746',
  Dragon: '#6F35FC',
  Fairy: '#D685AD',
  Fighting: '#C22E28',
  Fire: '#EE8130',
  Grass: '#7AC74C',
  Lightning: '#F7D02C',
  Metal: '#B7B7CE',
  Psychic: '#F95587',
  Water: '#6390F0',
}

const TYPE_ICONS: Record<string, string> = {
  Colorless: 'https://images.pokemontcg.io/types/colorless.png',
  Darkness: 'https://images.pokemontcg.io/types/darkness.png',
  Dragon: 'https://images.pokemontcg.io/types/dragon.png',
  Fairy: 'https://images.pokemontcg.io/types/fairy.png',
  Fighting: 'https://images.pokemontcg.io/types/fighting.png',
  Fire: 'https://images.pokemontcg.io/types/fire.png',
  Grass: 'https://images.pokemontcg.io/types/grass.png',
  Lightning: 'https://images.pokemontcg.io/types/lightning.png',
  Metal: 'https://images.pokemontcg.io/types/metal.png',
  Psychic: 'https://images.pokemontcg.io/types/psychic.png',
  Water: 'https://images.pokemontcg.io/types/water.png',
}

type ThemeType = {
  name: string
  color: string
  icon: string
}

export default function Themes() {
  const { theme, saveTheme } = useTheme()
  const [types, setTypes] = useState<ThemeType[]>([])

  useEffect(() => {
    fetch('https://api.pokemontcg.io/v2/types', {
      headers: { 'X-Api-Key': API_KEY },
    })
      .then(res => res.json())
      .then(data => {
        const apiTypes = (data.data || []).filter((t: string) => TYPE_COLORS[t])
        setTypes([
          {
            name: 'default',
            color: TYPE_COLORS.default,
            icon: '/vite.svg',
          },
          ...apiTypes.map((t: string) => ({
            name: t,
            color: TYPE_COLORS[t],
            icon: TYPE_ICONS[t] || '/vite.svg',
          })),
        ])
      })
  }, [])

  return (
    <div className="themes-bg min-vh-100 py-5">
      <div className="container">
        <h1 className="text-center mb-4" style={{ color: 'var(--theme-accent)' }}>
          Select Your Favorite Pokémon Type
        </h1>
        <div className="text-center mb-4" style={{ color: 'var(--theme-accent2)' }}>
          <small>Note: this will change your page theme slightly</small>
        </div>
        <div className="row g-4 justify-content-center">
          {types.map(type => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={type.name}>
              <div
                className={`theme-type-card${theme === type.name ? ' selected' : ''}`}
                style={{ borderColor: type.color }}
                onClick={() => saveTheme(type.name)}
              >
                <img
                  src={type.icon}
                  alt={type.name}
                  className="theme-type-icon"
                  style={{ background: type.color + '22' }}
                />
                <div className="theme-type-label" style={{ color: type.color }}>
                  {type.name === 'default'
                    ? 'Default (Red/Black)'
                    : type.name}
                </div>
                {theme === type.name && (
                  <div className="theme-type-selected-badge">Selected</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}