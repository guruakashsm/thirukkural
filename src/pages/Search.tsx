import { useState, useMemo, useCallback, useEffect, useDeferredValue, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import type { CategoryData, Kural } from '../hooks/useKurals'
import SearchBar from '../components/SearchBar'
import KuralCard from '../components/KuralCard'

type MatchMode = 'contains' | 'start' | 'end'
const QUERY_PARAM_SYNC_DEBOUNCE_MS = 180
const MAX_VISIBLE_RESULTS = 50
const RESULTS_BATCH_SIZE = 8
const RESULTS_BATCH_INTERVAL_MS = 24

const isMatchMode = (value: string | null): value is MatchMode => {
  return value === 'contains' || value === 'start' || value === 'end'
}

const parseChaptersFromParams = (params: URLSearchParams, categories: CategoryData[]) => {
  const next = new Set<number>()

  const chaptersParam = params.get('chapters')
  if (chaptersParam) {
    chaptersParam
      .split(',')
      .map(chunk => Number.parseInt(chunk, 10))
      .filter(num => !Number.isNaN(num) && num >= 1 && num <= 133)
      .forEach(num => next.add(num))
  }

  const chapterParam = Number.parseInt(params.get('chapter') || '', 10)
  if (!Number.isNaN(chapterParam) && chapterParam >= 1 && chapterParam <= 133) {
    next.add(chapterParam)
  }

  const categoryParam = (params.get('category') || '').toLowerCase()
  if (categoryParam) {
    const category = categories.find(c => c.name.toLowerCase() === categoryParam || c.englishName.toLowerCase() === categoryParam)
    category?.chapters.forEach(ch => next.add(ch.number))
  }

  return next
}

const writeChaptersToParams = (params: URLSearchParams, chapters: Set<number>) => {
  params.delete('category')
  params.delete('chapter')
  params.delete('chapters')

  if (chapters.size > 0) {
    const serialized = Array.from(chapters).sort((a, b) => a - b).join(',')
    params.set('chapters', serialized)
  }
}

const normalizeToken = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim()

const extractBoundaryWords = (tamilText: string) => {
  const words = tamilText
    .replace(/\n+/g, ' ')
    .trim()
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)

  return {
    first: words[0] || '',
    last: words[words.length - 1] || '',
  }
}

const toChapterKey = (chapters: Set<number>) =>
  Array.from(chapters).sort((a, b) => a - b).join(',')

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const { searchKurals, categories, kurals } = useKurals()
  const { t, lang, getMeaning, getCategoryName, getChapterName } = useLanguage()

  const queryFromParams = searchParams.get('q') || ''
  const [queryInput, setQueryInput] = useState(() => queryFromParams)
  const queryEditedRef = useRef(false)
  const deferredQueryInput = useDeferredValue(queryInput)
  const normalizedInput = queryInput.trim()
  const activeQuery = deferredQueryInput.trim()
  const isSearchPending = normalizedInput !== activeQuery
  const queryLabel = isSearchPending ? normalizedInput : activeQuery
  const matchMode: MatchMode = isMatchMode(searchParams.get('match')) ? (searchParams.get('match') as MatchMode) : 'contains'
  const selectedChapters = useMemo(() => parseChaptersFromParams(searchParams, categories), [searchParams, categories])
  const selectedChaptersKey = useMemo(() => toChapterKey(selectedChapters), [selectedChapters])
  const deferredSelectedChaptersKey = useDeferredValue(selectedChaptersKey)
  const deferredSelectedChapters = useMemo(() => {
    const next = new Set<number>()
    if (!deferredSelectedChaptersKey) return next
    deferredSelectedChaptersKey
      .split(',')
      .map(chunk => Number.parseInt(chunk, 10))
      .filter(num => !Number.isNaN(num))
      .forEach(num => next.add(num))
    return next
  }, [deferredSelectedChaptersKey])

  const hasFilters = selectedChapters.size > 0
  const effectiveHasFilters = deferredSelectedChapters.size > 0
  const isFilterPending = selectedChaptersKey !== deferredSelectedChaptersKey

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      setSearchParams((currentParams) => {
        const next = new URLSearchParams(currentParams)
        updater(next)
        return next
      }, { replace: true })
    },
    [setSearchParams]
  )

  useEffect(() => {
    if (!queryEditedRef.current) return

    const normalizedInput = queryInput.trim()
    const normalizedQueryParam = queryFromParams.trim()
    const shouldSyncQuery = normalizedInput !== normalizedQueryParam
    const shouldResetMatch = matchMode !== 'contains'

    if (!shouldSyncQuery && !shouldResetMatch) {
      queryEditedRef.current = false
      return
    }

    const timer = window.setTimeout(() => {
      updateSearchParams((params) => {
        if (normalizedInput) {
          params.set('q', normalizedInput)
        } else {
          params.delete('q')
        }

        if (params.get('match') === 'start' || params.get('match') === 'end') {
          params.delete('match')
        }
      })
      queryEditedRef.current = false
    }, QUERY_PARAM_SYNC_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [queryInput, queryFromParams, matchMode, updateSearchParams])

  const isCategorySelected = (catName: string) => {
    const cat = categories.find(c => c.name === catName)
    if (!cat) return false
    return cat.chapters.every(ch => selectedChapters.has(ch.number))
  }

  const isCategoryPartial = (catName: string) => {
    const cat = categories.find(c => c.name === catName)
    if (!cat) return false
    const count = cat.chapters.filter(ch => selectedChapters.has(ch.number)).length
    return count > 0 && count < cat.chapters.length
  }

  const toggleCategory = (catName: string) => {
    const cat = categories.find(c => c.name === catName)
    if (!cat) return

    const next = new Set(selectedChapters)
    if (isCategorySelected(catName)) {
      cat.chapters.forEach(ch => next.delete(ch.number))
    } else {
      cat.chapters.forEach(ch => next.add(ch.number))
    }

    updateSearchParams((params) => writeChaptersToParams(params, next))
  }

  const toggleChapter = (chapterNumber: number) => {
    const next = new Set(selectedChapters)
    if (next.has(chapterNumber)) {
      next.delete(chapterNumber)
    } else {
      next.add(chapterNumber)
    }

    updateSearchParams((params) => writeChaptersToParams(params, next))
  }

  const clearFilters = () =>
    updateSearchParams((params) => {
      params.delete('category')
      params.delete('chapter')
      params.delete('chapters')
    })

  const getLocalizedCategoryName = (englishName: string) =>
    getCategoryName(englishName) || t(englishName.toLowerCase()) || englishName

  const getLocalizedChapterName = (chapterNumber: number, tamilName: string, englishName: string) => {
    if (lang === 'ta') return tamilName
    return getChapterName(chapterNumber) || englishName
  }

  const handleQueryChange = (value: string) => {
    queryEditedRef.current = true
    setQueryInput(value)
  }

  const results = useMemo(() => {
    let filtered: Kural[]
    if (activeQuery) {
      if (matchMode === 'contains') {
        filtered = searchKurals(activeQuery)
      } else {
        const needle = normalizeToken(activeQuery)
        filtered = needle
          ? kurals.filter((k) => {
              const { first, last } = extractBoundaryWords(k.tamil)
              return matchMode === 'start' ? first === needle : last === needle
            })
          : []
      }
      if (effectiveHasFilters) {
        filtered = filtered.filter(k => deferredSelectedChapters.has(k.chapter))
      }
    } else if (effectiveHasFilters) {
      filtered = kurals.filter(k => deferredSelectedChapters.has(k.chapter))
    } else {
      filtered = []
    }

    return filtered.sort((a, b) => a.number - b.number)
  }, [activeQuery, matchMode, deferredSelectedChapters, effectiveHasFilters, searchKurals, kurals])

  const visibleResultTarget = Math.min(results.length, MAX_VISIBLE_RESULTS)
  const [visibleResultsCount, setVisibleResultsCount] = useState(0)

  useEffect(() => {
    const total = visibleResultTarget
    let intervalId: number | undefined

    const startId = window.setTimeout(() => {
      if (total <= 12) {
        setVisibleResultsCount(total)
        return
      }

      setVisibleResultsCount(Math.min(RESULTS_BATCH_SIZE, total))
      intervalId = window.setInterval(() => {
        setVisibleResultsCount((prev) => {
          const next = Math.min(prev + RESULTS_BATCH_SIZE, total)
          if (next >= total && intervalId) {
            window.clearInterval(intervalId)
            intervalId = undefined
          }
          return next
        })
      }, RESULTS_BATCH_INTERVAL_MS)
    }, 0)

    return () => {
      window.clearTimeout(startId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [visibleResultTarget, activeQuery, matchMode, deferredSelectedChaptersKey])

  const visibleResults = useMemo(
    () => results.slice(0, Math.min(visibleResultsCount, MAX_VISIBLE_RESULTS)),
    [results, visibleResultsCount]
  )

  const isResultRenderPending = visibleResultsCount < visibleResultTarget
  const isLoaderVisible = isSearchPending || isFilterPending || isResultRenderPending
  const loaderText = isSearchPending
    ? `${t('search')}...`
    : isFilterPending
    ? `${t('filterByChapter')}...`
    : `${t('results')}...`

  const shouldAnimateResults = results.length <= 12

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="font-tamil text-2xl md:text-3xl font-semibold text-dark ornamental-underline">
          {t('search')}
        </h1>
        <p className="text-sm text-gray mt-5">{t('search')}</p>
      </div>

      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
        <div className="flex-1">
          <SearchBar value={queryInput} onChange={handleQueryChange} placeholder={t('searchPlaceholder')} autoFocus />
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterOpen || hasFilters
              ? 'bg-gold/10 border-gold/40 text-gold-dark'
              : 'bg-white/80 border-gold/20 text-gray hover:border-gold/40'
          }`}
          aria-label={t('filterByChapter')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {hasFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-terracotta text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {selectedChapters.size}
            </span>
          )}
        </button>
      </div>

      {isLoaderVisible && (
        <div className="mb-4 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gold/10 border border-gold/25 text-gold-dark text-sm font-semibold animate-fade-in">
          <span className="w-4 h-4 rounded-full border-2 border-gold/35 border-t-gold animate-spin" aria-hidden="true" />
          <span>{loaderText}</span>
        </div>
      )}

      {filterOpen && (
        <div className="mb-6 palm-leaf-card p-5 animate-fade-in space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-dark">{t('filterByChapter')}</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-terracotta hover:text-terracotta/80 bg-transparent border-none cursor-pointer font-medium"
              >
                {t('clearAll')}
              </button>
            )}
          </div>

          {categories.map(cat => {
            const catSelected = isCategorySelected(cat.name)
            const catPartial = isCategoryPartial(cat.name)
            const localizedCatName = getLocalizedCategoryName(cat.englishName)
            const catSubLabel = lang === 'ta' ? cat.englishName : cat.tamilName

            return (
              <div key={cat.name} className="space-y-2.5">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex items-center gap-3 w-full bg-transparent border-none cursor-pointer text-left py-1"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      catSelected
                        ? 'border-gold-dark bg-gold-dark'
                        : catPartial
                        ? 'border-gold bg-gold/30'
                        : 'border-gray-light/40'
                    }`}
                  >
                    {(catSelected || catPartial) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        {catSelected
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        }
                      </svg>
                    )}
                  </div>
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-semibold text-dark">{localizedCatName}</span>
                  <span className="text-xs text-gray">— {catSubLabel}</span>
                  <span className="ml-auto text-[10px] text-gray-light">
                    {cat.chapters.length} {t('chapters').toLowerCase()}
                  </span>
                </button>

                <div className="flex flex-wrap gap-1.5 pl-8">
                  {cat.chapters.map(ch => {
                    const isSelected = selectedChapters.has(ch.number)
                    const localizedChapterName = getLocalizedChapterName(ch.number, ch.name, ch.englishName)
                    return (
                      <button
                        key={ch.number}
                        onClick={() => toggleChapter(ch.number)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gold/15 border-gold/40 text-gold-dark'
                            : 'bg-white border-gray-light/20 text-gray hover:border-gold/30 hover:text-gold-dark'
                        }`}
                        title={localizedChapterName}
                      >
                        <span>{localizedChapterName}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {hasFilters && !filterOpen && (
        <div className="flex flex-wrap gap-1.5 mb-4 animate-fade-in">
          {categories.map(cat => {
            const localizedCatName = getLocalizedCategoryName(cat.englishName)
            if (isCategorySelected(cat.name)) {
              return (
                <span
                  key={cat.name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold/10 text-gold-dark border border-gold/20"
                >
                  {cat.icon} {localizedCatName}
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="ml-0.5 bg-transparent border-none cursor-pointer text-gold-dark/50 hover:text-gold-dark p-0"
                  >
                    ×
                  </button>
                </span>
              )
            }
            return cat.chapters
              .filter(ch => selectedChapters.has(ch.number))
              .map(ch => (
                <span
                  key={ch.number}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold/10 text-gold-dark border border-gold/20"
                >
                  <span>{getLocalizedChapterName(ch.number, ch.name, ch.englishName)}</span>
                  <button
                    onClick={() => toggleChapter(ch.number)}
                    className="ml-0.5 bg-transparent border-none cursor-pointer text-gold-dark/50 hover:text-gold-dark p-0"
                  >
                    ×
                  </button>
                </span>
              ))
          })}
          <button
            onClick={clearFilters}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium text-terracotta bg-transparent border border-terracotta/20 cursor-pointer hover:bg-terracotta/5"
          >
            {t('clearAll')}
          </button>
        </div>
      )}

      <div>
        {(queryLabel || hasFilters || effectiveHasFilters) && (
          <p className="text-sm text-gray mb-4">
            <span className="font-tamil font-medium">{results.length}</span> {results.length !== 1 ? t('results') : t('result')}
            {queryLabel && <> {t('for')} "{queryLabel}"</>}
            {hasFilters && <span className="text-gray-light"> {t('filtered')}</span>}
          </p>
        )}

        {!activeQuery && !effectiveHasFilters && !isFilterPending && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-4xl mb-4 opacity-30">&#10043;</div>
            <p className="text-lg text-gray/60 mb-2">{t('searchEmpty')}</p>
            <p className="text-sm text-gray-light">{t('searchPlaceholder')}</p>
          </div>
        )}

        <div className={`space-y-3 ${shouldAnimateResults ? 'stagger-children' : ''}`}>
          {visibleResults.map(kural => (
            <KuralCard
              key={kural.number}
              number={kural.number}
              tamil={kural.tamil}
              englishMeaning={getMeaning(kural.number) || kural.englishMeaning}
            />
          ))}
          {results.length > MAX_VISIBLE_RESULTS && (
            <p className="text-center text-sm text-gray-light py-4">
              {t('showingFirst50')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
