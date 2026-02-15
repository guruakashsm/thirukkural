import { useParams, Link } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralCard from '../components/KuralCard'
import ChapterOverview from '../components/ChapterOverview'

export default function Chapter() {
  const { number } = useParams<{ number: string }>()
  const { getKuralsByChapter, categories } = useKurals()
  const { t, getChapterName, getMeaning } = useLanguage()

  const chapterNumber = parseInt(number || '1')
  const kurals = getKuralsByChapter(chapterNumber)

  let chapterInfo: { name: string; englishName: string } | undefined
  let categoryName = ''
  let chapterIcon = ''
  let categoryColor = ''
  for (const cat of categories) {
    const ch = cat.chapters.find(c => c.number === chapterNumber)
    if (ch) {
      chapterInfo = ch
      categoryName = cat.name
      chapterIcon = ch.icon || cat.icon
      categoryColor = cat.color
      break
    }
  }

  if (!chapterInfo || kurals.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-gray text-lg">{t('chapterNotFound').replace('#{number}', String(chapterNumber))}</p>
        <Link to="/" className="text-gold hover:text-gold-dark mt-4 inline-block no-underline">{t('goHome')}</Link>
      </div>
    )
  }

  const translatedChapterName = getChapterName(chapterNumber) || chapterInfo.englishName

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Link
        to={`/browse?category=${encodeURIComponent(categoryName)}&focus=division`}
        className="text-gray hover:text-gold-dark transition-colors text-sm no-underline flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
          style={{ backgroundColor: categoryColor + '15', border: `2px solid ${categoryColor}30` }}
        >
          {chapterIcon}
        </div>
        <p className="text-xs text-gray-light tracking-wider uppercase">{t('chapter')} {chapterNumber}</p>
        <h1 className="font-tamil text-2xl md:text-3xl font-bold text-dark mt-1">{chapterInfo.name}</h1>
        <p className="text-sm text-gray mt-1">{translatedChapterName}</p>
        <div className="kolam-divider mt-4">
          <span className="text-gold text-sm">&#10043;</span>
        </div>
      </div>

      <div className="mb-4">
        <ChapterOverview
          chapterNumber={chapterNumber}
          chapterName={chapterInfo.name}
          chapterEnglish={chapterInfo.englishName}
        />
      </div>

      <div className="space-y-3 stagger-children">
        {kurals.map(kural => (
          <KuralCard
            key={kural.number}
            number={kural.number}
            tamil={kural.tamil}
            englishMeaning={getMeaning(kural.number) || kural.englishMeaning}
          />
        ))}
      </div>
    </div>
  )
}
