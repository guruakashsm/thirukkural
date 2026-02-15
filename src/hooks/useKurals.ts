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

export function useKurals() {
  const kurals = kuralsData as Kural[]
  const categories = categoriesData as CategoryData[]

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
      if (!query.trim()) return []
      const lower = query.toLowerCase().trim()

      if (/^\d+$/.test(lower)) {
        const num = parseInt(lower)
        const exact = kurals.find(k => k.number === num)
        return exact ? [exact] : []
      }

      return kurals.filter(k =>
        k.tamil.includes(query) ||
        k.tamilMeaning.includes(query) ||
        k.englishMeaning.toLowerCase().includes(lower) ||
        k.chapterName.includes(query) ||
        k.chapterEnglish.toLowerCase().includes(lower)
      )
    }
  }, [kurals])

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
