import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralCard from '../components/KuralCard'
import SearchBar from '../components/SearchBar'

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, getKuralsByChapter, searchKurals } = useKurals()
  const { t, getChapterName, getMeaning, getCategoryName } = useLanguage()

  const requestedChapter = useMemo(() => {
    const chapterParam = Number.parseInt(searchParams.get('chapter') || '', 10)
    if (!Number.isNaN(chapterParam)) {
      return Math.min(Math.max(chapterParam, 1), 133)
    }

    const categoryParam = (searchParams.get('category') || '').toLowerCase()
    if (categoryParam) {
      const selectedCategory = categories.find(cat => cat.name.toLowerCase() === categoryParam)
      if (selectedCategory?.chapters[0]) {
        return selectedCategory.chapters[0].number
      }
    }

    return 1
  }, [searchParams, categories])

  const [currentChapter, setCurrentChapter] = useState(requestedChapter)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setCurrentChapter(requestedChapter)
  }, [requestedChapter])

  // Derive current division from chapter
  const currentDivision = useMemo(() => {
    for (const cat of categories) {
      if (cat.chapters.some(ch => ch.number === currentChapter)) return cat
    }
    return categories[0]
  }, [currentChapter, categories])

  // Get chapter info
  const chapterInfo = useMemo(() => {
    for (const cat of categories) {
      const ch = cat.chapters.find(c => c.number === currentChapter)
      if (ch) return { ...ch, categoryColor: cat.color, categoryIcon: cat.icon }
    }
    return null
  }, [currentChapter, categories])

  // Kurals for current chapter
  const chapterKurals = useMemo(() => getKuralsByChapter(currentChapter), [currentChapter, getKuralsByChapter])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchKurals(searchQuery).slice(0, 50)
  }, [searchQuery, searchKurals])

  const isSearching = searchQuery.trim().length > 0

  // Navigate to chapter
  const navigateToChapter = (n: number) => {
    setCurrentChapter(n)
    setSearchParams({ chapter: String(n) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll to division tabs on focus=division
  useEffect(() => {
    const focus = searchParams.get('focus')
    if (focus === 'division') {
      document.getElementById('division-tabs')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [searchParams])

  const translatedChapterName = chapterInfo ? (getChapterName(currentChapter) || chapterInfo.englishName) : ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* A. Back link + page title */}
      <Link to="/" className="text-gray hover:text-gold-dark transition-colors text-sm no-underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('home')}
      </Link>

      <div className="text-center mb-6">
        <h1 className="font-tamil text-2xl md:text-3xl font-semibold text-dark ornamental-underline">
          {t('browseKurals')}
        </h1>
      </div>

      {/* B. Division tabs */}
      <div id="division-tabs" className="flex gap-2 mb-6 justify-center">
        {categories.map(cat => {
          const isActive = currentDivision?.name === cat.name
          const translatedName = getCategoryName(cat.englishName) || t(cat.englishName.toLowerCase())
          return (
            <button
              key={cat.name}
              onClick={() => navigateToChapter(cat.chapters[0].number)}
              className="px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all"
              style={{
                backgroundColor: isActive ? cat.color + '20' : 'transparent',
                borderColor: isActive ? cat.color : cat.color + '30',
                color: isActive ? cat.color : '#888',
              }}
            >
              {cat.icon} {translatedName}
            </button>
          )
        })}
      </div>

      {/* C. Chapter selector + Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={currentChapter}
          onChange={(e) => navigateToChapter(Number(e.target.value))}
          className="flex-1 px-4 py-3 rounded-2xl border border-gold/20 bg-white/80 text-sm font-medium text-dark cursor-pointer hover:border-gold/40 transition-all appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {currentDivision?.chapters.map(ch => (
            <option key={ch.number} value={ch.number}>
              {ch.number}. {ch.name} — {getChapterName(ch.number) || ch.englishName}
            </option>
          ))}
        </select>
        <div className="sm:w-64">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t('searchPlaceholder')} />
        </div>
      </div>

      {/* D. Chapter header (when not searching) */}
      {!isSearching && chapterInfo && (
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
            style={{ backgroundColor: chapterInfo.categoryColor + '15', border: `2px solid ${chapterInfo.categoryColor}30` }}
          >
            {chapterInfo.icon || currentDivision?.icon}
          </div>
          <p className="text-xs text-gray-light tracking-wider uppercase">{t('chapter')} {currentChapter}</p>
          <h2 className="font-tamil text-2xl md:text-3xl font-bold text-dark mt-1">{chapterInfo.name}</h2>
          <p className="text-sm text-gray mt-1">{translatedChapterName}</p>
          <div className="kolam-divider mt-4">
            <span className="text-gold text-sm">&#10043;</span>
          </div>
        </div>
      )}

      {/* Search results indicator */}
      {isSearching && (
        <p className="text-sm text-gray mb-4">
          <span className="font-tamil font-medium">{searchResults.length}</span> {searchResults.length !== 1 ? t('results') : t('result')} {t('for')} "{searchQuery}"
          {searchResults.length >= 50 && (
            <span className="text-gray-light block mt-1 text-xs">{t('showingFirst50')}</span>
          )}
        </p>
      )}

      {/* E. Kural list */}
      <div className="space-y-3 stagger-children">
        {(isSearching ? searchResults : chapterKurals).map(kural => (
          <KuralCard
            key={kural.number}
            number={kural.number}
            tamil={kural.tamil}
            englishMeaning={getMeaning(kural.number) || kural.englishMeaning}
          />
        ))}
      </div>

      {/* F. Chapter pagination (when not searching) */}
      {!isSearching && (
        <div className="flex items-center justify-between mt-8 gap-4">
          <button
            onClick={() => currentChapter > 1 && navigateToChapter(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-gold/20 bg-white/80 cursor-pointer hover:border-gold/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t('previousChapter')}</span>
          </button>

          <span className="text-xs text-gray-light font-medium">{currentChapter} / 133</span>

          <button
            onClick={() => currentChapter < 133 && navigateToChapter(currentChapter + 1)}
            disabled={currentChapter >= 133}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-gold/20 bg-white/80 cursor-pointer hover:border-gold/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">{t('nextChapter')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
