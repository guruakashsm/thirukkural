import { useParams, Link } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'

export default function Category() {
  const { name } = useParams<{ name: string }>()
  const { getCategory } = useKurals()
  const { t, getChapterName } = useLanguage()

  const category = getCategory(name || '')

  if (!category) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-gray text-lg">{t('categoryNotFound')}</p>
        <Link to="/" className="text-gold hover:text-gold-dark mt-4 inline-block no-underline">{t('goHome')}</Link>
      </div>
    )
  }

  const categoryKey = category.englishName.toLowerCase() as 'virtue' | 'wealth' | 'love'
  const translatedCategoryName = t(categoryKey)
  const descKey = `desc${category.name}` as 'descAram' | 'descPorul' | 'descInbam'
  const translatedDescription = t(descKey)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="text-gray hover:text-gold-dark transition-colors text-sm no-underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('home')}
      </Link>

      <div className="text-center mb-10 animate-fade-in">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{ backgroundColor: category.color + '15', border: `2px solid ${category.color}30` }}
        >
          {category.icon}
        </div>
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark">{category.tamilName}</h1>
        <p className="text-lg font-medium mt-1" style={{ color: category.color }}>{translatedCategoryName}</p>
        <p className="text-gray text-sm mt-3 max-w-lg mx-auto">{translatedDescription}</p>
        <div className="kolam-divider mt-6">
          <span className="text-gold text-sm">&#10043;</span>
        </div>
      </div>

      <p className="text-xs text-gray-light mb-4 animate-fade-in">
        {category.chapters.length} {t('chapters')} &middot; {category.chapters.length * 10} {t('kurals').toLowerCase()}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 stagger-children">
        {category.chapters.map(chapter => {
          const translatedChapterName = getChapterName(chapter.number) || chapter.englishName
          return (
            <Link
              key={chapter.number}
              to={`/chapter/${chapter.number}`}
              className="group relative flex flex-col items-center text-center no-underline rounded-2xl p-6 pb-5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl min-h-[180px] justify-center"
              style={{
                background: `linear-gradient(160deg, #FDFBF7 0%, ${category.color}08 40%, ${category.color}15 100%)`,
                border: `1px solid ${category.color}25`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 group-hover:h-1.5 transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, ${category.color}00, ${category.color}, ${category.color}00)`,
                  opacity: 0.5,
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${category.color}15 0%, transparent 70%)`,
                }}
              />
              <span
                className="absolute top-3 left-4 font-tamil text-2xl font-black opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                style={{ color: category.color }}
              >
                {chapter.number}
              </span>
              <span className="text-2xl mb-2 opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
                {chapter.icon}
              </span>
              <p className="relative font-tamil text-lg font-bold text-dark leading-snug group-hover:text-gold-dark transition-colors duration-200">
                {chapter.name}
              </p>
              <p className="relative text-xs text-gray mt-1.5 leading-snug">{translatedChapterName}</p>
              <div
                className="relative mt-4 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundColor: category.color + '18',
                  color: category.color,
                  border: `1px solid ${category.color}20`,
                }}
              >
                {t('kural')} {chapter.kuralStart}–{chapter.kuralEnd}
              </div>
              <div
                className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-30 group-hover:opacity-70 group-hover:scale-150 transition-all duration-300"
                style={{ backgroundColor: category.color }}
              />
              <div
                className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full opacity-30 group-hover:opacity-70 group-hover:scale-150 transition-all duration-300"
                style={{ backgroundColor: category.color }}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
