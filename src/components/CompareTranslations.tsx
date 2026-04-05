import { useEnrichedData } from '../hooks/useEnrichedData'
import { useLanguage } from '../contexts/LanguageContext'
import Accordion from './Accordion'

interface CompareTranslationsProps {
  kuralNumber: number
}

export default function CompareTranslations({ kuralNumber }: CompareTranslationsProps) {
  const { getKuralEnriched } = useEnrichedData()
  const { t } = useLanguage()
  const data = getKuralEnriched(kuralNumber)

  if (!data?.translations) return null

  const {
    english, tamil,
    hindi = [], kannada = [], sanskrit = [],
    french = [], german = [], malayalam = [], telugu = [], korean = [],
  } = data.translations
  const totalScholars = english.length + tamil.length + hindi.length + kannada.length + sanskrit.length
    + french.length + german.length + malayalam.length + telugu.length + korean.length

  const otherLangs = [
    { key: 'hindi',    label: 'Hindi',    entries: hindi,    icon: '🇮🇳' },
    { key: 'kannada',  label: 'Kannada',  entries: kannada,  icon: '🌺' },
    { key: 'sanskrit', label: 'Sanskrit', entries: sanskrit, icon: '🕉️' },
    { key: 'french',   label: 'French',   entries: french,   icon: '🇫🇷' },
    { key: 'german',   label: 'German',   entries: german,   icon: '🇩🇪' },
    { key: 'malayalam',label: 'Malayalam',entries: malayalam, icon: '🌴' },
    { key: 'telugu',   label: 'Telugu',   entries: telugu,   icon: '🌸' },
    { key: 'korean',   label: 'Korean',   entries: korean,   icon: '🇰🇷' },
  ].filter(l => l.entries.length > 0)

  return (
    <Accordion title={t('compareTranslations')} icon="📜" badge={`${totalScholars} ${t('scholars')}`}>
      <div className="space-y-6 text-sm">
        {tamil.length > 0 && (
          <section className="rounded-2xl border border-terracotta/30 bg-gradient-to-br from-cream via-parchment/30 to-cream-dark p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-terracotta font-semibold flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-terracotta/15 text-base">
                  🪔
                </span>
                {t('tamilInterpretations')}
              </h4>
              <span className="px-2.5 py-1 text-[11px] rounded-full bg-cream border border-terracotta/30 text-terracotta font-semibold">
                {tamil.length}
              </span>
            </div>
            <div className="space-y-3">
              {tamil.map((tr, i) => (
                <article
                  key={`${tr.scholar}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-terracotta/25 bg-cream/90 p-4 pl-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-terracotta/45 hover:shadow-[0_10px_24px_-18px_rgba(184,92,56,0.75)]"
                >
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-terracotta to-copper" />
                  <p className="text-temple-brown leading-relaxed font-tamil">"{tr.text}"</p>
                  <p className="text-terracotta text-xs mt-2 font-tamil font-medium">— {tr.scholar}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {english.length > 0 && (
          <section className="rounded-2xl border border-gold/30 bg-gradient-to-br from-cream via-parchment/30 to-cream-dark p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gold-dark font-semibold flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-gold/20 text-base">
                  🌍
                </span>
                {t('englishTranslations')}
              </h4>
              <span className="px-2.5 py-1 text-[11px] rounded-full bg-cream border border-gold/30 text-gold-dark font-semibold">
                {english.length}
              </span>
            </div>
            <div className="space-y-3">
              {english.map((tr, i) => (
                <article
                  key={`${tr.scholar}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-gold/25 bg-cream/90 p-4 pl-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_10px_24px_-18px_rgba(168,139,62,0.75)]"
                >
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-gold to-gold-dark" />
                  <p className="text-gray leading-relaxed italic">"{tr.text}"</p>
                  <p className="text-gold-dark/90 text-xs mt-2 font-medium">— {tr.scholar}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {otherLangs.map(({ key, label, entries, icon }) => (
          <section key={key} className="rounded-2xl border border-gold/20 bg-gradient-to-br from-cream via-parchment/20 to-cream-dark p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-dark font-semibold flex items-center gap-2">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-gold/10 text-base">
                  {icon}
                </span>
                {label}
              </h4>
              <span className="px-2.5 py-1 text-[11px] rounded-full bg-cream border border-gold/20 text-gold-dark font-semibold">
                {entries.length}
              </span>
            </div>
            <div className="space-y-3">
              {entries.map((tr, i) => (
                <article
                  key={`${tr.scholar}-${i}`}
                  className="group relative overflow-hidden rounded-xl border border-gold/20 bg-cream/90 p-4 pl-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_10px_24px_-18px_rgba(168,139,62,0.6)]"
                >
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-gold/60 to-gold-dark/60" />
                  <p className="text-gray leading-relaxed">"{tr.text}"</p>
                  <p className="text-gold-dark/80 text-xs mt-2 font-medium">— {tr.scholar}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Accordion>
  )
}
