import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKurals } from '../hooks/useKurals'
import { useLanguage } from '../contexts/LanguageContext'
import KuralCard from '../components/KuralCard'
import RealLifeApplication from '../components/RealLifeApplication'
import CompareTranslations from '../components/CompareTranslations'
import KuralStory from '../components/KuralStory'

export default function KuralDetail() {
  const { number } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const { getKural, getRandomKural, categories } = useKurals()
  const { t, getMeaning, getChapterName } = useLanguage()

  const kuralNumber = parseInt(number || '1')
  const kural = getKural(kuralNumber)

  if (!kural) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-fade-in">
        <p className="text-gray text-lg">{t('kuralNotFound').replace('#{number}', String(kuralNumber))}</p>
        <Link to="/" className="text-gold hover:text-gold-dark mt-4 inline-block no-underline">{t('goHome')}</Link>
      </div>
    )
  }

  const handleRandom = () => {
    const random = getRandomKural()
    navigate(`/kural/${random.number}`)
  }

  const translatedMeaning = getMeaning(kural.number)
  const chapterNameTranslated = getChapterName(kural.chapter)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray hover:text-gold-dark transition-colors bg-transparent border-none cursor-pointer text-sm mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </button>

      <div className="text-center mb-6">
        {(() => {
          const cat = categories.find(c => c.chapters.some(ch => ch.number === kural.chapter))
          if (!cat) return null
          const chapter = cat.chapters.find(ch => ch.number === kural.chapter)
          const icon = chapter?.icon || cat.icon
          return (
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-xl"
              style={{ backgroundColor: cat.color + '15', border: `2px solid ${cat.color}30` }}
            >
              {icon}
            </div>
          )
        })()}
        <p className="text-xs text-gray-light tracking-wider uppercase">{t('chapter')} {kural.chapter}</p>
        <p className="font-tamil text-lg text-gold-dark font-medium mt-1">{kural.chapterName}</p>
        <p className="text-sm text-gray">{chapterNameTranslated || kural.chapterEnglish}</p>
        <div className="kolam-divider mt-4">
          <span className="text-gold text-sm">&#10043;</span>
        </div>
      </div>

      <KuralCard
        number={kural.number}
        tamil={kural.tamil}
        tamilMeaning={kural.tamilMeaning}
        englishMeaning={translatedMeaning || kural.englishMeaning}
        showFull
      />

      <div className="flex items-center justify-between mt-6">
        {kuralNumber > 1 ? (
          <button
            onClick={() => navigate(`/kural/${kuralNumber - 1}`)}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gold/20 text-gray hover:text-gold-dark hover:border-gold/50 transition-all cursor-pointer text-sm"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('kural')} {kuralNumber - 1}
          </button>
        ) : <div />}

        <button
          onClick={handleRandom}
          className="px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold-dark hover:bg-gold/20 transition-all cursor-pointer text-sm font-medium"
        >
          {t('random')}
        </button>

        {kuralNumber < 1330 ? (
          <button
            onClick={() => navigate(`/kural/${kuralNumber + 1}`)}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gold/20 text-gray hover:text-gold-dark hover:border-gold/50 transition-all cursor-pointer text-sm"
          >
            {t('kural')} {kuralNumber + 1}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : <div />}
      </div>

      <div className="space-y-4 mt-6">
        <RealLifeApplication kuralNumber={kural.number} />
        <CompareTranslations kuralNumber={kural.number} />
        <KuralStory kuralNumber={kural.number} />
      </div>
    </div>
  )
}
