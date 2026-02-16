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
  tokens: string[]
}

interface SearchHit {
  kural: Kural
  score: number
}

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const tokenize = (value: string) => normalizeText(value).split(' ').filter(Boolean)

const isSubsequence = (needle: string, haystack: string) => {
  if (!needle || needle.length > haystack.length) return false
  let needleIndex = 0
  for (const ch of haystack) {
    if (ch === needle[needleIndex]) {
      needleIndex += 1
      if (needleIndex === needle.length) return true
    }
  }
  return false
}

const levenshteinDistance = (left: string, right: string, maxDistance: number) => {
  const a = [...left]
  const b = [...right]
  if (!a.length) return b.length
  if (!b.length) return a.length
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  let prev = new Array(b.length + 1).fill(0).map((_, i) => i)
  let curr = new Array(b.length + 1).fill(0)

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i
    let rowMin = curr[0]

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      )
      rowMin = Math.min(rowMin, curr[j])
    }

    if (rowMin > maxDistance) return maxDistance + 1
    const nextPrev = curr
    curr = prev
    prev = nextPrev
  }

  return prev[b.length]
}

const isFuzzyTokenMatch = (queryToken: string, candidateToken: string) => {
  if (candidateToken.includes(queryToken)) return true
  if (queryToken.length >= 3 && isSubsequence(queryToken, candidateToken)) return true

  const maxDistance = queryToken.length <= 4 ? 1 : 2
  return levenshteinDistance(queryToken, candidateToken, maxDistance) <= maxDistance
}

const scoreIndexedKural = (entry: IndexedKural, normalizedQuery: string, queryTokens: string[]) => {
  let score = 0
  const phraseIndex = entry.joinedText.indexOf(normalizedQuery)
  if (phraseIndex >= 0) {
    score += 95 + Math.max(0, 20 - phraseIndex)
  }

  if (!queryTokens.length) return score

  for (const queryToken of queryTokens) {
    if (entry.tokens.includes(queryToken)) {
      score += 38
      continue
    }

    const prefixMatch = entry.tokens.some((token) => token.startsWith(queryToken))
    if (prefixMatch) {
      score += 30
      continue
    }

    const partialMatch = entry.tokens.some((token) => token.includes(queryToken))
    if (partialMatch) {
      score += 22
      continue
    }

    const fuzzyMatch = queryToken.length >= 3 && entry.tokens.some((token) => isFuzzyTokenMatch(queryToken, token))
    if (fuzzyMatch) {
      score += 14
      continue
    }

    return 0
  }

  return score + queryTokens.length * 4
}

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

        const normalizedFields = fields.map(normalizeText).filter(Boolean)
        const tokens = Array.from(new Set(normalizedFields.flatMap((field) => tokenize(field))))

        return {
          kural,
          joinedText: normalizedFields.join(' '),
          tokens,
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
      if (!query.trim()) return []
      const trimmedQuery = query.trim()
      const normalizedQuery = normalizeText(trimmedQuery)
      if (!normalizedQuery) return []

      if (/^\d+$/.test(normalizedQuery)) {
        const num = parseInt(normalizedQuery, 10)
        const exact = kurals.find(k => k.number === num)
        return exact ? [exact] : []
      }

      const queryTokens = normalizedQuery.split(' ').filter(Boolean)
      const hits: SearchHit[] = []

      for (const entry of indexedKurals) {
        const score = scoreIndexedKural(entry, normalizedQuery, queryTokens)
        if (score > 0) {
          hits.push({ kural: entry.kural, score })
        }
      }

      return hits
        .sort((left, right) => {
          if (right.score !== left.score) return right.score - left.score
          return left.kural.number - right.kural.number
        })
        .map((hit) => hit.kural)
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
