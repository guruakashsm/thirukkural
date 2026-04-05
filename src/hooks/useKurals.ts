import { useMemo } from 'react'
import kuralsData from '../data/kurals.json'
import categoriesData from '../data/categories.json'

export interface Kural {
  number: number
  tamil: string
  tamilMeaning: string
  englishMeaning: string
  chapter: number
  chapterName: string
  chapterEnglish: string
  category: string
  audioPath?: string
  audioWithPorulPath?: string
}

export interface Chapter {
  number: number
  name: string
  englishName: string
  icon?: string
  kuralStart: number
  kuralEnd: number
}

export interface CategoryData {
  name: string
  tamilName: string
  englishName: string
  description: string
  icon: string
  color: string
  chapters: Chapter[]
}

interface IndexedKural {
  kural: Kural
  joinedText: string
}

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function useKurals() {
  const kurals = kuralsData as Kural[]
  const categories = categoriesData as CategoryData[]

  const indexedKurals = useMemo<IndexedKural[]>(
    () =>
      kurals.map((kural) => {
        const fields = [
          kural.tamil,
          kural.tamilMeaning,
          kural.englishMeaning,
          kural.chapterName,
          kural.chapterEnglish,
          String(kural.number),
        ]
        return {
          kural,
          joinedText: fields.map(normalizeText).filter(Boolean).join(' '),
        }
      }),
    [kurals]
  )

  const getKural = (number: number): Kural | undefined => {
    return kurals.find(k => k.number === number)
  }

  const getKuralsByChapter = (chapterNumber: number): Kural[] => {
    return kurals.filter(k => k.chapter === chapterNumber)
  }

  const getCategory = (name: string): CategoryData | undefined => {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase())
  }

  const getKuralOfTheDay = (dayOffset = 0): Kural => {
    const today = new Date()
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    )
    const index = ((dayOfYear + dayOffset) % kurals.length + kurals.length) % kurals.length
    return kurals[index]
  }

  const getRandomKural = (): Kural => {
    return kurals[Math.floor(Math.random() * kurals.length)]
  }

  const searchKurals = useMemo(() => {
    return (query: string): Kural[] => {
      const normalized = normalizeText(query.trim())
      if (!normalized) return []

      // Number lookup — return exact kural
      if (/^\d+$/.test(normalized)) {
        const num = parseInt(normalized, 10)
        const exact = kurals.find(k => k.number === num)
        return exact ? [exact] : []
      }

      const tokens = normalized.split(' ').filter(Boolean)

      const phraseMatches: Kural[] = []
      const tokenMatches: Kural[] = []

      for (const entry of indexedKurals) {
        if (entry.joinedText.includes(normalized)) {
          phraseMatches.push(entry.kural)
        } else if (tokens.every(t => entry.joinedText.includes(t))) {
          tokenMatches.push(entry.kural)
        }
      }

      return [...phraseMatches, ...tokenMatches]
    }
  }, [kurals, indexedKurals])

  const getBookmarks = (): number[] => {
    const saved = localStorage.getItem('bookmarks')
    return saved ? JSON.parse(saved) : []
  }

  const isBookmarked = (number: number): boolean => {
    return getBookmarks().includes(number)
  }

  const toggleBookmark = (number: number): boolean => {
    let bookmarks = getBookmarks()
    const wasBookmarked = bookmarks.includes(number)
    if (wasBookmarked) {
      bookmarks = bookmarks.filter(n => n !== number)
    } else {
      bookmarks.push(number)
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
    window.dispatchEvent(new CustomEvent('bookmarks-changed'))
    return !wasBookmarked
  }

  const getBookmarkedKurals = (): Kural[] => {
    const bookmarkNumbers = getBookmarks()
    return kurals.filter(k => bookmarkNumbers.includes(k.number))
  }

  return {
    kurals, categories,
    getKural, getKuralsByChapter, getCategory, getKuralOfTheDay, getRandomKural, searchKurals,
    getBookmarks, isBookmarked, toggleBookmark, getBookmarkedKurals,
  }
}
