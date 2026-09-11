import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'preact/compat'
import { UserTheme } from '../types/app'
import { $userTheme } from '../stores/preferences'

export type Theme = 'figma' | 'penpot' | 'sketch' | 'framer'
export type Mode =
  | 'figma-light'
  | 'figma-dark'
  | 'figjam'
  | 'penpot-light'
  | 'penpot-dark'
  | 'sketch-light'
  | 'sketch-dark'
  | 'framer-light'
  | 'framer-dark'

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

// Figjam has no light/dark variant, so a user override cannot apply to it
const resolveMode = (theme: Theme, mode: Mode, userTheme: UserTheme): Mode =>
  userTheme === 'system' || mode === 'figjam'
    ? mode
    : (`${theme}-${userTheme}` as Mode)

export const ThemeProvider = ({
  theme,
  mode,
  children,
}: ThemeProviderProps) => {
  const [userTheme, setUserTheme] = useState($userTheme.get())

  useEffect(() => $userTheme.subscribe(setUserTheme), [])

  const effectiveMode = resolveMode(theme, mode, userTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-mode', effectiveMode)
  }, [theme, effectiveMode])

  return (
    <ThemeContext.Provider value={{ theme, mode: effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
