import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import categoriesData from '../data/categories.json'

type ChapterMeta = {
  number: number
  name: string
  englishName: string
}

const chapterMap = (categoriesData as Array<{ chapters: ChapterMeta[] }>).reduce<Record<number, ChapterMeta>>((acc, category) => {
  category.chapters.forEach((chapter) => {
    acc[chapter.number] = chapter
  })
  return acc
}, {})

export default function History() {
  const { t, lang, getChapterName } = useLanguage()
  const divisions = [
    { name: t('historyDivisionAramName'), sub: t('historyDivisionAramSub'), chapters: 38, color: '#C6A75E' },
    { name: t('historyDivisionPorulName'), sub: t('historyDivisionPorulSub'), chapters: 70, color: '#8B6914' },
    { name: t('historyDivisionInbamName'), sub: t('historyDivisionInbamSub'), chapters: 25, color: '#B85450' },
  ]
  const recognitionItems = [
    { icon: '🏆', label: t('globalUnescoLabel'), desc: t('globalUnescoDesc') },
    { icon: '🌐', label: t('globalLangLabel'), desc: t('globalLangDesc') },
    { icon: '🗽', label: t('globalStatueLabel'), desc: t('globalStatueDesc') },
  ]
  const famousAdhikarams = [40, 79, 8, 1, 39]
  const popularCouplets = ['எண்ணென்ப', 'இடும்பைக்கு', 'கற்க', 'தெய்வத்தான்', 'தொழுதகை']
  const frequentWords = [
    { word: 'படும்', count: 42 },
    { word: 'தரும்', count: 37 },
    { word: 'இல்', count: 32 },
    { word: 'கெடும்', count: 28 },
    { word: 'இல்லை', count: 22 },
  ]
  const frequentStarts = [
    { word: 'ஆற்றின்', count: 5 },
    { word: 'இன்பம்', count: 5 },
    { word: 'நனவினால்', count: 5 },
    { word: 'காமம்', count: 4 },
    { word: 'காமக்', count: 4 },
  ]
  const frequentEnds = [
    { word: 'படும்', count: 42 },
    { word: 'தரும்', count: 37 },
    { word: 'இல்', count: 32 },
    { word: 'கெடும்', count: 28 },
    { word: 'செயல்', count: 22 },
  ]

  const getHistoryChapterName = (chapterNumber: number) => {
    const chapter = chapterMap[chapterNumber]
    if (!chapter) return `${t('chapter')} ${chapterNumber}`
    if (lang === 'ta') return chapter.name
    return getChapterName(chapterNumber) || chapter.englishName
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark ornamental-underline">
          {t('history')}
        </h1>
        <p className="text-sm text-gray mt-5">{t('historySubtitle')}</p>
      </div>

      {/* About Thiruvalluvar */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                🪔
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('aboutThiruvalluvar')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13">
              {t('aboutThiruvalluvarDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl border border-gold/20 overflow-hidden bg-white">
          <div className="h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                📜
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('originOfThirukkural')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13">
              {t('originDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                📚
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('structureOfThirukkural')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13 mb-6">
              {t('structureDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-13">
              {divisions.map((div) => (
                <div
                  key={div.sub}
                  className="rounded-xl p-4 border text-center"
                  style={{ borderColor: div.color + '40', backgroundColor: div.color + '10' }}
                >
                  <p className="font-tamil text-base font-bold" style={{ color: div.color }}>{div.name}</p>
                  <p className="text-xs text-gray mt-1">{div.sub}</p>
                  <p className="text-2xl font-bold mt-2" style={{ color: div.color }}>{div.chapters}</p>
                  <p className="text-xs text-gray">{t('chapters')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Significance */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl border border-gold/20 overflow-hidden bg-white">
          <div className="h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                🏛️
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('culturalSignificance')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13">
              {t('culturalDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Global Recognition */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                🌍
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('globalRecognition')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13 mb-6">
              {t('globalDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-13">
              {recognitionItems.map((item) => (
                <div key={item.label} className="flex gap-3 p-4 rounded-xl bg-white/60 border border-gold/10">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-dark">{item.label}</p>
                    <p className="text-xs text-gray mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Literary Excellence */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl border border-gold/20 overflow-hidden bg-white">
          <div className="h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                ✍️
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('literaryExcellence')}</h2>
            </div>
            <p className="text-sm md:text-base text-gray leading-relaxed ml-13">
              {t('literaryDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Textual Tradition */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                📘
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('textualTraditionTitle')}</h2>
            </div>

            <div className="space-y-4 ml-13">
              <p className="text-sm md:text-base text-gray leading-relaxed">
                {t('textualTraditionP1')}
              </p>
              <p className="text-sm md:text-base text-gray leading-relaxed">
                {t('textualTraditionP2')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 ml-13">
              {[
                { label: t('statsPaal'), value: 3 },
                { label: t('statsIyal'), value: 13 },
                { label: t('statsAdhikaram'), value: 133 },
                { label: t('statsKural'), value: 1330 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gold/25 bg-white/70 p-4 text-center">
                  <p className="text-2xl font-bold text-gold-dark">{item.value}</p>
                  <p className="text-xs text-gray mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            <p className="text-sm md:text-base text-gray leading-relaxed mt-6 ml-13">
              {t('textualTraditionP3')}
            </p>

            <div className="mt-5 ml-13 rounded-xl border border-gold/25 bg-white/65 p-4">
              <p className="text-sm md:text-base text-dark italic leading-relaxed">
                {t('textualTraditionMedicineQuote')}
              </p>
            </div>

            <p className="text-sm md:text-base text-gray leading-relaxed mt-5 ml-13">
              {t('textualTraditionP4')}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Literary Insights */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-2xl border border-gold/20 overflow-hidden bg-white">
          <div className="h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-lg">
                🔎
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-dark">{t('historyInteractiveTitle')}</h2>
            </div>

            <p className="text-xs md:text-sm text-gray ml-13 mb-6">
              {t('historyInteractiveSubtitle')}
            </p>

            <div className="space-y-6 ml-13">
              <div>
                <p className="font-tamil text-base md:text-lg font-semibold text-dark">{t('historyFamousChaptersTitle')}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {famousAdhikarams.map((item) => (
                    <Link
                      key={item}
                      to={`/browse?chapter=${item}&focus=division`}
                      className="no-underline px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-gold/30 text-gold-dark bg-gold/10 hover:bg-gold/20 transition-colors"
                    >
                      {getHistoryChapterName(item)}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-tamil text-base md:text-lg font-semibold text-dark">{t('historyPopularCoupletsTitle')}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularCouplets.map((word) => (
                    <Link
                      key={word}
                      to={`/search?q=${encodeURIComponent(word)}`}
                      className="no-underline px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-gold/30 text-gold-dark bg-gold/10 hover:bg-gold/20 transition-colors"
                    >
                      {word}..
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-tamil text-base md:text-lg font-semibold text-dark">{t('historyFrequentWordTitle')}</p>
                <p className="text-xs text-gray mt-0.5">{t('historyFrequentWordSubtitle')}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {frequentWords.map((item) => (
                    <Link
                      key={item.word}
                      to={`/search?q=${encodeURIComponent(item.word)}`}
                      className="no-underline px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-gold/30 text-gold-dark bg-gold/10 hover:bg-gold/20 transition-colors"
                    >
                      {item.word} - {item.count}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-tamil text-base md:text-lg font-semibold text-dark">{t('historyFrequentStartTitle')}</p>
                <p className="text-xs text-gray mt-0.5">{t('historyFrequentStartSubtitle')}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {frequentStarts.map((item) => (
                    <Link
                      key={item.word}
                      to={`/search?q=${encodeURIComponent(item.word)}&match=start`}
                      className="no-underline px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-gold/30 text-gold-dark bg-gold/10 hover:bg-gold/20 transition-colors"
                    >
                      {item.word} - {item.count}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-tamil text-base md:text-lg font-semibold text-dark">{t('historyFrequentEndTitle')}</p>
                <p className="text-xs text-gray mt-0.5">{t('historyFrequentEndSubtitle')}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {frequentEnds.map((item) => (
                    <Link
                      key={item.word}
                      to={`/search?q=${encodeURIComponent(item.word)}&match=end`}
                      className="no-underline px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border border-gold/30 text-gold-dark bg-gold/10 hover:bg-gold/20 transition-colors"
                    >
                      {item.word} - {item.count}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
