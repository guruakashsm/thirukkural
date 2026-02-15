import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralText from './KuralText'
import KuralAudioPlayer from './KuralAudioPlayer'
import { shareKuralAsImage } from '../utils/shareCard'

interface KuralCardProps {
  number: number
  tamil: string
  tamilMeaning?: string
  englishMeaning?: string
  showFull?: boolean
}

export default function KuralCard({ number, tamil, tamilMeaning, englishMeaning, showFull = false }: KuralCardProps) {
  const { toggleBookmark: toggleBM, isBookmarked: checkBookmarked, getKural, getCategory } = useKurals()
  const { t, lang, getMeaning, getChapterName } = useLanguage()
  const [bookmarked, setBookmarked] = useState(() => checkBookmarked(number))
  const kuralData = getKural(number)

  useEffect(() => {
    const handleChange = () => setBookmarked(checkBookmarked(number))
    window.addEventListener('bookmarks-changed', handleChange)
    return () => window.removeEventListener('bookmarks-changed', handleChange)
  }, [number, checkBookmarked])

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = toggleBM(number)
    setBookmarked(newState)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const catData = kuralData ? getCategory(kuralData.category) : undefined
    const meaningText = getMeaning(number) || englishMeaning || ''
    const chapterName = kuralData ? (getChapterName(kuralData.chapter) || kuralData.chapterEnglish) : ''
    const categoryName = catData ? t(catData.englishName.toLowerCase()) : ''
    await shareKuralAsImage({
      kuralNumber: number,
      tamil,
      meaning: meaningText,
      englishMeaning: kuralData?.englishMeaning || englishMeaning || '',
      tamilMeaning: kuralData?.tamilMeaning || tamilMeaning || '',
      chapterName,
      categoryName,
      categoryColor: catData?.color || '#C6A75E',
      lang,
    })
  }

  const card = (
    <div className="palm-leaf-card p-6 hover:shadow-lg hover:border-gold/60 transition-all duration-500 animate-fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rotate-45 border-2 border-gold/60 flex items-center justify-center bg-gold/5">
          <span className="-rotate-45 font-tamil text-sm font-bold text-gold-dark">{number}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-full transition-all duration-300 bg-transparent border-none cursor-pointer ${bookmarked ? 'text-gold scale-110' : 'text-gray-light hover:text-gold'}`}
            aria-label={bookmarked ? t('removeFromWatchlist') : t('addToWatchlist')}
          >
            <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:text-gold text-gray-light transition-colors bg-transparent border-none cursor-pointer"
            aria-label={t('share')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <KuralText tamil={tamil} baseSizePx={showFull ? 28 : 22} className="mb-5" />

      {showFull && tamilMeaning && (
        <div className="mb-4">
          <div className="kolam-divider text-xs font-medium text-gold-dark mb-2">
            <span>{t('tamilMeaning')}</span>
          </div>
          <p className="font-tamil text-base text-gray leading-relaxed">{tamilMeaning}</p>
        </div>
      )}

      {englishMeaning && (
        <div>
          <div className="kolam-divider text-xs font-medium text-gold-dark mb-2">
            <span>{t('meaning')}</span>
          </div>
          <p className={`text-sm text-gray leading-relaxed ${!showFull ? 'line-clamp-2' : ''}`}>{englishMeaning}</p>
        </div>
      )}

      {showFull && (
        <KuralAudioPlayer
          audioPath={kuralData?.audioPath}
          audioWithPorulPath={kuralData?.audioWithPorulPath}
          compact={false}
          className="mt-4"
        />
      )}
    </div>
  )

  if (showFull) return card

  return (
    <Link to={`/kural/${number}`} className="no-underline block">
      {card}
    </Link>
  )
}
