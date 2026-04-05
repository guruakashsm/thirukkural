import { useState, useMemo, useCallback, useEffect, useRef, useDeferredValue } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import type { CategoryData } from '../hooks/useKurals'
import SearchBar from '../components/SearchBar'
import KuralCard from '../components/KuralCard'

const MAX_RESULTS = 50
const URL_SYNC_DEBOUNCE_MS = 250

const parseChaptersFromParams = (params: URLSearchParams, categories: CategoryData[]) => {
  const next = new Set<number>()

  const chaptersParam = params.get('chapters')
  if (chaptersParam) {
    chaptersParam
      .split(',')
      .map(s => parseInt(s, 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= 133)
      .forEach(n => next.add(n))
  }

  const chapterParam = parseInt(params.get('chapter') || '', 10)
  if (!isNaN(chapterParam) && chapterParam >= 1 && chapterParam <= 133) {
    next.add(chapterParam)
  }

  const categoryParam = (params.get('category') || '').toLowerCase()
  if (categoryParam) {
    const cat = categories.find(c =>
      c.name.toLowerCase() === categoryParam || c.englishName.toLowerCase() === categoryParam
    )
    cat?.chapters.forEach(ch => next.add(ch.number))
  }

  return next
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const { searchKurals, categories, kurals } = useKurals()
  const { t, lang, getMeaning, getCategoryName, getChapterName } = useLanguage()

  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const deferredQuery = useDeferredValue(query)
  const selectedChapters = useMemo(
    () => parseChaptersFromParams(searchParams, categories),
    [searchParams, categories]
  )

  const urlSyncTimer = useRef<number | undefined>(undefined)

  const updateSearchParams = useCallback(
    (updater: (p: URLSearchParams) => void) => {
      setSearchParams(current => {
        const next = new URLSearchParams(current)
        updater(next)
        return next
      }, { replace: true })
    },
    [setSearchParams]
  )

  // Debounce query → URL sync
  useEffect(() => {
    clearTimeout(urlSyncTimer.current)
    urlSyncTimer.current = window.setTimeout(() => {
      updateSearchParams(p => {
        if (query.trim()) p.set('q', query.trim())
        else p.delete('q')
      })
    }, URL_SYNC_DEBOUNCE_MS)
    return () => clearTimeout(urlSyncTimer.current)
  }, [query, updateSearchParams])

  const results = useMemo(() => {
    const q = deferredQuery.trim()
    if (!q && selectedChapters.size === 0) return []

    let list = q ? searchKurals(q) : kurals

    if (selectedChapters.size > 0) {
      list = list.filter(k => selectedChapters.has(k.chapter))
    }

    return list.slice(0, MAX_RESULTS)
  }, [deferredQuery, selectedChapters, searchKurals, kurals])

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const isCategorySelected = (catName: string) => {
    const cat = categories.find(c => c.name === catName)
    return cat ? cat.chapters.every(ch => selectedChapters.has(ch.number)) : false
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
    updateSearchParams(p => {
      p.delete('category'); p.delete('chapter'); p.delete('chapters')
      if (next.size > 0) p.set('chapters', Array.from(next).sort((a, b) => a - b).join(','))
    })
  }

  const toggleChapter = (chapterNumber: number) => {
    const next = new Set(selectedChapters)
    if (next.has(chapterNumber)) next.delete(chapterNumber)
    else next.add(chapterNumber)
    updateSearchParams(p => {
      p.delete('category'); p.delete('chapter'); p.delete('chapters')
      if (next.size > 0) p.set('chapters', Array.from(next).sort((a, b) => a - b).join(','))
    })
  }

  const clearFilters = () =>
    updateSearchParams(p => { p.delete('category'); p.delete('chapter'); p.delete('chapters') })

  const localCatName = (englishName: string) =>
    getCategoryName(englishName) || t(englishName.toLowerCase()) || englishName

  const localChapterName = (num: number, tamilName: string, englishName: string) =>
    lang === 'ta' ? tamilName : (getChapterName(num) || englishName)

  const hasFilters = selectedChapters.size > 0
  const hasQuery = deferredQuery.trim().length > 0

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
          <SearchBar value={query} onChange={setQuery} placeholder={t('searchPlaceholder')} autoFocus />
        </div>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
            filterOpen || hasFilters
              ? 'bg-gold/10 border-gold/40 text-gold-dark'
              : 'bg-cream/80 border-gold/20 text-gray hover:border-gold/40'
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
            return (
              <div key={cat.name} className="space-y-2.5">
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex items-center gap-3 w-full bg-transparent border-none cursor-pointer text-left py-1"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      catSelected ? 'border-gold-dark bg-gold-dark'
                        : catPartial ? 'border-gold bg-gold/30'
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
                  <span className="text-sm font-semibold text-dark">{localCatName(cat.englishName)}</span>
                  <span className="text-xs text-gray">— {lang === 'ta' ? cat.englishName : cat.tamilName}</span>
                  <span className="ml-auto text-[10px] text-gray-light">
                    {cat.chapters.length} {t('chapters').toLowerCase()}
                  </span>
                </button>

                <div className="flex flex-wrap gap-1.5 pl-8">
                  {cat.chapters.map(ch => {
                    const isSelected = selectedChapters.has(ch.number)
                    return (
                      <button
                        key={ch.number}
                        onClick={() => toggleChapter(ch.number)}
                        title={localChapterName(ch.number, ch.name, ch.englishName)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gold/15 border-gold/40 text-gold-dark'
                            : 'bg-cream border-gray-light/20 text-gray hover:border-gold/30 hover:text-gold-dark'
                        }`}
                      >
                        {localChapterName(ch.number, ch.name, ch.englishName)}
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
            if (isCategorySelected(cat.name)) {
              return (
                <span key={cat.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold/10 text-gold-dark border border-gold/20">
                  {cat.icon} {localCatName(cat.englishName)}
                  <button onClick={() => toggleCategory(cat.name)} className="ml-0.5 bg-transparent border-none cursor-pointer text-gold-dark/50 hover:text-gold-dark p-0">×</button>
                </span>
              )
            }
            return cat.chapters
              .filter(ch => selectedChapters.has(ch.number))
              .map(ch => (
                <span key={ch.number} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gold/10 text-gold-dark border border-gold/20">
                  {localChapterName(ch.number, ch.name, ch.englishName)}
                  <button onClick={() => toggleChapter(ch.number)} className="ml-0.5 bg-transparent border-none cursor-pointer text-gold-dark/50 hover:text-gold-dark p-0">×</button>
                </span>
              ))
          })}
          <button onClick={clearFilters} className="px-2.5 py-1 rounded-full text-[11px] font-medium text-terracotta bg-transparent border border-terracotta/20 cursor-pointer hover:bg-terracotta/5">
            {t('clearAll')}
          </button>
        </div>
      )}

      <div>
        {(hasQuery || hasFilters) && (
          <p className="text-sm text-gray mb-4">
            <span className="font-tamil font-medium">{results.length}</span> {results.length !== 1 ? t('results') : t('result')}
            {hasQuery && <> {t('for')} "{query.trim()}"</>}
            {hasFilters && <span className="text-gray-light"> {t('filtered')}</span>}
          </p>
        )}

        {!hasQuery && !hasFilters && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-4xl mb-4 opacity-30">&#10043;</div>
            <p className="text-lg text-gray/60 mb-2">{t('searchEmpty')}</p>
            <p className="text-sm text-gray-light">{t('searchPlaceholder')}</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map(kural => (
            <KuralCard
              key={kural.number}
              number={kural.number}
              tamil={kural.tamil}
              englishMeaning={getMeaning(kural.number) || kural.englishMeaning}
            />
          ))}
          {results.length === MAX_RESULTS && (
            <p className="text-center text-sm text-gray-light py-4">
              {t('showingFirst50')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
