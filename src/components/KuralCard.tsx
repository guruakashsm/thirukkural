import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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
  const [shareOpen, setShareOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const kuralData = getKural(number)
  const navigate = useNavigate()

  useEffect(() => {
    const handleChange = () => setBookmarked(checkBookmarked(number))
    window.addEventListener('bookmarks-changed', handleChange)
    return () => window.removeEventListener('bookmarks-changed', handleChange)
  }, [number, checkBookmarked])

  useEffect(() => {
    if (!shareOpen) return
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [shareOpen])

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
    <div className="palm-leaf-card interactive-hover-card p-6 hover:shadow-lg hover:border-gold/60 transition-all duration-500 animate-fade-in-up">
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
          <div className="relative" ref={shareRef}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareOpen(prev => !prev) }}
              className="p-2 rounded-full hover:text-gold text-gray-light transition-colors bg-transparent border-none cursor-pointer"
              aria-label={t('share')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {shareOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-xl border border-gold/20 py-1 min-w-[160px] animate-fade-in-up"
                style={{ background: 'var(--color-cream)', animationDuration: '150ms' }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={async (e) => { e.preventDefault(); setShareOpen(false); await handleShare(e) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-dark hover:bg-gold/6 transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Share as Image
                </button>
                <div className="mx-3 border-t border-gold/10" />
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShareOpen(false); navigate(`/widgets?n=${number}`) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-dark hover:bg-gold/6 transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Embed Widget
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <KuralText
        tamil={tamil}
        baseSizePx={showFull ? 28 : 23}
        minSizePx={showFull ? 12 : 10}
        lineHeight={showFull ? 1.76 : 1.66}
        className="mb-5"
      />

      {showFull && tamilMeaning && (
        <div className="mb-4">
          <div className="kolam-divider text-xs font-medium text-gold-dark mb-2">
            <span>{t('tamilMeaning')}</span>
          </div>
          <p className="font-tamil text-base sm:text-[1.05rem] text-gray leading-[1.72] font-medium">{tamilMeaning}</p>
        </div>
      )}

      {englishMeaning && (
        <div>
          <div className="kolam-divider text-xs font-medium text-gold-dark mb-2">
            <span>{t('meaning')}</span>
          </div>
          <p className={`text-sm sm:text-[0.98rem] text-gray leading-[1.72] font-normal ${!showFull ? 'line-clamp-2' : ''}`}>{englishMeaning}</p>
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
