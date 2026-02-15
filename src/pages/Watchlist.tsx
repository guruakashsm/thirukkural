import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralCard from '../components/KuralCard'

export default function Watchlist() {
  const { getBookmarkedKurals } = useKurals()
  const { t, getMeaning } = useLanguage()
  const [bookmarkedKurals, setBookmarkedKurals] = useState(getBookmarkedKurals())

  useEffect(() => {
    const handleChange = () => setBookmarkedKurals(getBookmarkedKurals())
    window.addEventListener('bookmarks-changed', handleChange)
    return () => window.removeEventListener('bookmarks-changed', handleChange)
  }, [getBookmarkedKurals])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-fade-in">
        <p className="text-sm font-medium text-gold uppercase tracking-[0.3em] mb-3">{t('yourCollection')}</p>
        <h1 className="font-tamil text-2xl md:text-3xl font-semibold text-dark ornamental-underline">
          சேமித்தவை
        </h1>
        <p className="text-sm text-gray mt-5">{t('watchlist')}</p>
        {bookmarkedKurals.length > 0 && (
          <p className="text-sm text-gray mt-2">
            <span className="font-tamil font-medium">{bookmarkedKurals.length}</span> {bookmarkedKurals.length !== 1 ? t('kuralsSaved') : t('kuralSaved')}
          </p>
        )}
      </div>

      {bookmarkedKurals.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="font-tamil text-lg text-dark mb-2">இன்னும் குறள்கள் சேமிக்கவில்லை</p>
          <p className="text-sm text-gray mb-8 max-w-sm mx-auto">
            {t('noKuralsSaved')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-medium text-sm hover:bg-gold-dark transition-colors no-underline shadow-sm"
          >
            {t('exploreKurals')}
          </Link>
        </div>
      )}

      {bookmarkedKurals.length > 0 && (
        <div className="space-y-4 stagger-children">
          {bookmarkedKurals.map(kural => (
            <KuralCard
              key={kural.number}
              number={kural.number}
              tamil={kural.tamil}
              tamilMeaning={kural.tamilMeaning}
              englishMeaning={getMeaning(kural.number) || kural.englishMeaning}
            />
          ))}
        </div>
      )}
    </div>
  )
}
