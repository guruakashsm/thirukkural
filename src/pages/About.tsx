import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-lg shadow-sm">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-dark">{title}</h2>
    </div>
  )
}

export default function About() {
  const { t } = useLanguage()
  const sectionCard = 'group relative rounded-2xl border border-gold/20 bg-white p-5 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(92,61,46,0.12)]'

  const sections = [
    { icon: '🪔', title: t('aboutVisionTitle'), body: t('aboutVisionBody') },
    { icon: '🧭', title: t('aboutWhyTitle'), body: t('aboutWhyBody') },
    { icon: '🎯', title: t('aboutIntentionTitle'), body: t('aboutIntentionBody') },
    { icon: '✨', title: t('aboutDifferentTitle'), body: t('aboutDifferentBody') },
    { icon: '🏛️', title: t('aboutCultureTitle'), body: t('aboutCultureBody') },
    { icon: '🔄', title: t('aboutImproveTitle'), body: t('aboutImproveBody') },
  ]

  function renderContent(content: string) {
    const blocks = content.split('\n\n').map((block) => block.trim()).filter(Boolean)

    return blocks.map((block, index) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
      const allBullets = lines.length > 0 && lines.every((line) => line.startsWith('- '))

      if (allBullets) {
        return (
          <ul key={`${block.slice(0, 20)}-${index}`} className="text-sm md:text-base text-gray leading-relaxed list-disc pl-5 space-y-1.5">
            {lines.map((line) => (
              <li key={line}>{line.replace(/^- /, '')}</li>
            ))}
          </ul>
        )
      }

      return (
        <p key={`${block.slice(0, 20)}-${index}`} className="text-sm md:text-base text-gray leading-relaxed">
          {block}
        </p>
      )
    })
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-6 border border-gold/25 bg-white/70">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <section className="relative rounded-3xl overflow-hidden border border-gold/25 hero-card-bg paper-texture p-6 md:p-8 mb-7 shadow-[0_16px_35px_rgba(168,139,62,0.14)]">
        <div className="corner-ornament top-left left-3 top-3" />
        <div className="corner-ornament top-right right-3 top-3" />
        <div className="corner-ornament bottom-left left-3 bottom-3" />
        <div className="corner-ornament bottom-right right-3 bottom-3" />
        <div className="temple-border-top" />

        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-gold-dark/70 font-semibold mb-2">{t('aboutHeroTagline')}</p>
          <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark mb-2 ornamental-underline">
            {t('aboutUs')}
          </h1>
          <p className="text-sm text-gray mt-5 max-w-2xl mx-auto leading-relaxed">
            {t('aboutHeroSubtext')}
          </p>
        </div>
      </section>

      <div className="space-y-5">
        {sections.map((section) => (
          <section key={section.title} className={section.title === t('aboutImproveTitle') ? `${sectionCard} bg-gradient-to-br from-white to-cream-dark/50` : sectionCard}>
            <SectionTitle icon={section.icon} title={section.title} />
            <div className="space-y-3">
              {renderContent(section.body)}
            </div>
          </section>
        ))}

        <div className="pt-2">
          <div className="lotus-separator mb-4">
            <span className="text-gold/60 text-xs">✦</span>
          </div>
          <p className="text-sm md:text-base text-dark font-medium text-center">
            {t('aboutFinalMotto')}
          </p>
          <p className="text-sm md:text-base text-gold-dark font-semibold text-center mt-3">
            {t('aboutThanksNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
