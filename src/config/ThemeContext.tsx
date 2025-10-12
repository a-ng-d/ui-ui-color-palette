import React, { createContext, ReactNode, useContext } from 'react'

export type Theme = 'figma' | 'penpot' | 'sketch'
export type Mode =
  | 'figma-light'
  | 'figma-dark'
  | 'figjam'
  | 'penpot-dark'
  | 'penpot-light'
  | 'sketch-dark'
  | 'sketch-light'

interface ThemeContextType {
  theme: Theme
  mode: Mode
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  theme: Theme
  mode: Mode
  children: ReactNode
}

export const ThemeProvider = ({
  theme,
  mode,
  children,
}: ThemeProviderProps) => {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-mode', mode)
  }, [theme, mode])

  return (
    <ThemeContext.Provider value={{ theme, mode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
