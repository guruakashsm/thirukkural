import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export default function HowToRead() {
  const { t } = useLanguage()
  const steps = [
    { title: t('howToReadStep1Title'), desc: t('howToReadStep1Desc') },
    { title: t('howToReadStep2Title'), desc: t('howToReadStep2Desc') },
    { title: t('howToReadStep3Title'), desc: t('howToReadStep3Desc') },
    { title: t('howToReadStep4Title'), desc: t('howToReadStep4Desc') },
  ]
  const audiences = [
    { title: t('howToReadStudentsTitle'), desc: t('howToReadStudentsDesc') },
    { title: t('howToReadScholarsTitle'), desc: t('howToReadScholarsDesc') },
    { title: t('howToReadResearchersTitle'), desc: t('howToReadResearchersDesc') },
  ]
  const weeklyMethod = [
    t('howToReadMethod1'),
    t('howToReadMethod2'),
    t('howToReadMethod3'),
    t('howToReadMethod4'),
  ]
  const indexLabel = (index: number) => String(index + 1).padStart(2, '0')

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-8 -left-16 h-40 w-40 rounded-full bg-gold/6 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-44 w-44 rounded-full bg-terracotta/6 blur-3xl" />
      </div>

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-8 group">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <header className="text-center mb-8 md:mb-10 animate-fade-in-up">
        <h1 className="font-tamil text-3xl md:text-5xl font-bold ornamental-underline gold-gradient-text">
          {t('howToRead')}
        </h1>
        <p className="text-sm md:text-base text-gray mt-5 max-w-2xl mx-auto leading-relaxed">{t('howToReadSubtitle')}</p>
      </header>

      <div className="stagger-children space-y-6">
        <section className="howto-scene">
          <div className="howto-card paper-texture p-6 md:p-8">
            <p className="text-sm md:text-base text-gray leading-relaxed md:leading-7 mb-6 md:mb-7 howto-layer">
              {t('howToReadIntro')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {steps.map((step, index) => (
                <article key={step.title} className="howto-subcard">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="howto-badge">{indexLabel(index)}</div>
                    <h3 className="text-base font-semibold text-dark">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray leading-relaxed">{step.desc}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 md:mt-7 rounded-xl border border-gold/20 bg-cream/85 backdrop-blur-sm px-4 py-4 md:px-5 md:py-4 howto-tip">
              <p className="font-semibold text-dark mb-1.5">{t('howToReadTipTitle')}</p>
              <p className="text-sm text-gray leading-relaxed">{t('howToReadTipDesc')}</p>
            </div>
          </div>
        </section>

        <section className="howto-scene">
          <div className="howto-card p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-dark mb-5 md:mb-6 howto-layer">{t('howToReadAudienceTitle')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {audiences.map((audience, index) => (
                <article key={audience.title} className="howto-audience-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="howto-chip">{indexLabel(index)}</div>
                    <h3 className="font-semibold text-dark">{audience.title}</h3>
                  </div>
                  <p className="text-sm text-gray leading-relaxed">{audience.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="howto-scene">
          <div className="howto-card p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-dark mb-5 md:mb-6 howto-layer">{t('howToReadMethodTitle')}</h2>
            <ul className="space-y-3">
              {weeklyMethod.map((method, index) => (
                <li key={method} className="howto-method-item">
                  <span className="howto-method-index">{indexLabel(index)}</span>
                  <p className="text-sm text-gray leading-relaxed">{method}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
