import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function Explore() {
  const { t } = useLanguage()
  const articles = [
    {
      icon: '\u{1F389}',
      title: t('exploreArticle1Title'),
      description: t('exploreArticle1Desc'),
      url: 'https://en.wikipedia.org/wiki/Thiruvalluvar_Day',
    },
    {
      icon: '📖',
      title: t('exploreArticle2Title'),
      description: t('exploreArticle2Desc'),
      url: 'https://en.wikipedia.org/wiki/Tirukku%E1%B9%9Ba%E1%B8%B7',
    },
    {
      icon: '⚖️',
      title: t('exploreArticle3Title'),
      description: t('exploreArticle3Desc'),
      url: 'https://en.wikipedia.org/wiki/Tirukku%E1%B9%9Ba%E1%B8%B7',
    },
    {
      icon: '🏺',
      title: t('exploreArticle4Title'),
      description: t('exploreArticle4Desc'),
      url: 'https://en.wikipedia.org/wiki/Sangam_literature',
    },
  ]

  const places = [
    {
      icon: '🗽',
      name: t('explorePlace1Name'),
      location: t('explorePlace1Location'),
      description: t('explorePlace1Desc'),
      relevance: t('explorePlace1Relevance'),
    },
    {
      icon: '🏛️',
      name: t('explorePlace2Name'),
      location: t('explorePlace2Location'),
      description: t('explorePlace2Desc'),
      relevance: t('explorePlace2Relevance'),
    },
    {
      icon: '🎓',
      name: t('explorePlace3Name'),
      location: t('explorePlace3Location'),
      description: t('explorePlace3Desc'),
      relevance: t('explorePlace3Relevance'),
    },
    {
      icon: '📍',
      name: t('explorePlace4Name'),
      location: t('explorePlace4Location'),
      description: t('explorePlace4Desc'),
      relevance: t('explorePlace4Relevance'),
    },
    {
      icon: '🏛️',
      name: t('explorePlace5Name'),
      location: t('explorePlace5Location'),
      description: t('explorePlace5Desc'),
      relevance: t('explorePlace5Relevance'),
    },
    {
      icon: '🌊',
      name: t('explorePlace6Name'),
      location: t('explorePlace6Location'),
      description: t('explorePlace6Desc'),
      relevance: t('explorePlace6Relevance'),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark ornamental-underline">
          {t('explore')}
        </h1>
        <p className="text-sm text-gray mt-5">{t('exploreSubtitle')}</p>
      </div>

      {/* News & Articles */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📰</span>
          <h2 className="text-xl md:text-2xl font-bold text-dark">{t('newsAndArticles')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {articles.map((article) => (
            <div key={article.title} className="rounded-2xl border border-gold/20 overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
              <div className="h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-40" />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{article.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-dark mb-2">{article.title}</h3>
                    <p className="text-sm text-gray leading-relaxed mb-3">{article.description}</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark hover:text-gold transition-colors no-underline"
                    >
                      {t('visitWebsite')}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Heritage Places */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🗺️</span>
          <h2 className="text-xl md:text-2xl font-bold text-dark">{t('placesToVisit')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {places.map((place) => (
            <div key={place.name} className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{ background: 'linear-gradient(135deg, #FDF8EE 0%, #F5EDD6 100%)' }}>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{place.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-dark">{place.name}</h3>
                    <p className="text-xs text-gold-dark font-medium mb-2">{place.location}</p>
                    <p className="text-sm text-gray leading-relaxed mb-2">{place.description}</p>
                    <p className="text-xs text-gold-dark/80 italic">{place.relevance}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
