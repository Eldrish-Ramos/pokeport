import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useApolloClient, gql } from '@apollo/client'

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  saveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  saveTheme: () => {},
})

const SET_THEME_MUTATION = gql`
  mutation SetTheme($theme: String!) {
    setTheme(theme: $theme) {
      id
      theme
    }
  }
`

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => localStorage.getItem('theme') || 'default')
  const client = useApolloClient()

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  // Save theme to backend if logged in
  const saveTheme = (t: string) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    document.body.setAttribute('data-theme', t)
    const token = localStorage.getItem('token')
    if (token) {
      client.mutate({ mutation: SET_THEME_MUTATION, variables: { theme: t } }).catch(() => {})
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: saveTheme, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}