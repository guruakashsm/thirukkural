import { useParams, Link } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralCard from '../components/KuralCard'
import ChapterOverview from '../components/ChapterOverview'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Chapter() {
  const { number } = useParams<{ number: string }>()
  const { getKuralsByChapter, categories } = useKurals()
  const { t, lang, getChapterName, getMeaning, getCategoryName } = useLanguage()

  const chapterNumber = parseInt(number || '1')
  const kurals = getKuralsByChapter(chapterNumber)

  let chapterInfo: { name: string; englishName: string } | undefined
  let categoryName = ''
  let categoryEnglishName = ''
  let chapterIcon = ''
  let categoryColor = ''
  for (const cat of categories) {
    const ch = cat.chapters.find(c => c.number === chapterNumber)
    if (ch) {
      chapterInfo = ch
      categoryName = cat.name
      categoryEnglishName = cat.englishName
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
  const translatedCategoryName =
    getCategoryName(categoryEnglishName) || t(categoryEnglishName.toLowerCase()) || categoryName
  const breadcrumbChapterName = lang === 'ta' ? chapterInfo.name : translatedChapterName
  const chapterBreadcrumbLabel = `${chapterNumber}. ${breadcrumbChapterName}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: t('home'), to: '/' },
          { label: translatedCategoryName, to: `/category/${encodeURIComponent(categoryName)}` },
          { label: chapterBreadcrumbLabel },
        ]}
      />

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
