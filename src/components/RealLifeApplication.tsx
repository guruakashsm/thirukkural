import { useEnrichedData } from '../hooks/useEnrichedData'
import { useLanguage } from '../contexts/LanguageContext'
import Accordion from './Accordion'

interface RealLifeApplicationProps {
  kuralNumber: number
}

export default function RealLifeApplication({ kuralNumber }: RealLifeApplicationProps) {
  const { getKuralEnriched } = useEnrichedData()
  const { t } = useLanguage()
  const data = getKuralEnriched(kuralNumber)

  if (!data?.application) return null

  return (
    <Accordion title={t('howToApply')} icon="💡">
      <div className="text-sm space-y-3">
        <p className="text-gray leading-relaxed">{data.application.summary}</p>
        <ol className="list-none space-y-2 pl-0">
          {data.application.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/15 text-gold-dark text-xs font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-gray leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Accordion>
  )
}
