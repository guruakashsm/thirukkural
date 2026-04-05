import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type Theme = 'classic' | 'dark' | 'sepia' | 'night'
export type FontSize = 'small' | 'medium' | 'large'

interface SettingsContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  fontSize: FontSize
  setFontSize: (s: FontSize) => void
  showYouTube: boolean
  setShowYouTube: (v: boolean) => void
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
}

// Apply immediately (before first render) to avoid flash
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size]
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme') as Theme | null
    const initial = saved || 'classic'
    applyTheme(initial)
    return initial
  })

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('app-font-size') as FontSize | null
    const initial = saved || 'medium'
    applyFontSize(initial)
    return initial
  })

  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    applyFontSize(fontSize)
  }, [fontSize])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('app-theme', t)
  }, [])

  const setFontSize = useCallback((s: FontSize) => {
    setFontSizeState(s)
    localStorage.setItem('app-font-size', s)
  }, [])

  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  return (
    <SettingsContext.Provider value={{ theme, setTheme, fontSize, setFontSize, settingsOpen, openSettings, closeSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
