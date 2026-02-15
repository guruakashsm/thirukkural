import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import uiTranslations from '../data/ui-translations.json'

export type Language = 'ta' | 'en' | 'hi' | 'te' | 'kn' | 'ml' | 'fr' | 'de' | 'ru' | 'zh' | 'ms' | 'pl' | 'si' | 'sv'

export const LANGUAGES: { code: Language; nativeName: string; englishName: string }[] = [
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'zh', nativeName: '汉语', englishName: 'Chinese' },
  { code: 'ms', nativeName: 'Melayu', englishName: 'Malay' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish' },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala' },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish' },
]

type CatTranslations = { categories: Record<string, Record<string, string>>; chapters: Record<string, Record<string, string>> }

// Lazy-load translation data
let kuralTranslationsCache: Record<string, Record<string, string>> | null = null
let categoryTranslationsCache: CatTranslations | null = null

async function loadKuralTranslations(): Promise<Record<string, Record<string, string>>> {
  if (!kuralTranslationsCache) {
    try {
      const mod = await import('../data/kural-translations.json')
      kuralTranslationsCache = mod.default
    } catch {
      kuralTranslationsCache = {}
    }
  }
  return kuralTranslationsCache!
}

async function loadCategoryTranslations(): Promise<CatTranslations> {
  if (!categoryTranslationsCache) {
    try {
      const mod = await import('../data/category-translations.json')
      categoryTranslationsCache = mod.default as CatTranslations
    } catch {
      categoryTranslationsCache = { categories: {}, chapters: {} }
    }
  }
  return categoryTranslationsCache!
}

const ui = uiTranslations as Record<string, Record<string, string>>

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
  getMeaning: (kuralNumber: number) => string | null
  getChapterName: (chapterNumber: number) => string | null
  getCategoryName: (englishName: string) => string | null
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language')
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved as Language
    return 'en'
  })

  // Eagerly loaded translation caches (populated after first render)
  const [kuralData, setKuralData] = useState<Record<string, Record<string, string>>>({})
  const [catData, setCatData] = useState<{ categories: Record<string, Record<string, string>>; chapters: Record<string, Record<string, string>> }>({ categories: {}, chapters: {} })

  useEffect(() => {
    loadKuralTranslations().then(setKuralData)
    loadCategoryTranslations().then(setCatData)
  }, [])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('app-language', newLang)
  }, [])

  const t = useCallback((key: string): string => {
    // Try current language first, fall back to English
    const langStrings = ui[lang]
    if (langStrings && langStrings[key]) return langStrings[key]
    const enStrings = ui['en']
    if (enStrings && enStrings[key]) return enStrings[key]
    return key
  }, [lang])

  const getMeaning = useCallback((kuralNumber: number): string | null => {
    if (lang === 'en' || lang === 'ta') return null // Use existing data for en/ta
    const kural = kuralData[String(kuralNumber)]
    if (kural && kural[lang]) return kural[lang]
    return null // Fallback: caller should use English
  }, [lang, kuralData])

  const getChapterName = useCallback((chapterNumber: number): string | null => {
    if (lang === 'en' || lang === 'ta') return null
    const chapters = catData.chapters[lang]
    if (chapters && chapters[String(chapterNumber)]) return chapters[String(chapterNumber)]
    return null
  }, [lang, catData])

  const getCategoryName = useCallback((englishName: string): string | null => {
    if (lang === 'en' || lang === 'ta') return null
    const cats = catData.categories[lang]
    if (cats && cats[englishName]) return cats[englishName]
    return null
  }, [lang, catData])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, getMeaning, getChapterName, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
