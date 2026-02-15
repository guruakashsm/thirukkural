import { useEnrichedData } from '../hooks/useEnrichedData'
import { useLanguage } from '../contexts/LanguageContext'
import Accordion from './Accordion'

interface ChapterOverviewProps {
  chapterNumber: number
  chapterName: string
  chapterEnglish: string
}

export default function ChapterOverview({ chapterNumber, chapterName, chapterEnglish }: ChapterOverviewProps) {
  const { getChapterEnriched } = useEnrichedData()
  const { t, getChapterName } = useLanguage()
  const data = getChapterEnriched(chapterNumber)

  if (!data) return null

  const translatedName = getChapterName(chapterNumber) || chapterEnglish

  return (
    <Accordion
      title={`${t('chapter')} ${chapterNumber}: ${translatedName}`}
      icon="🏛️"
      badge={chapterName}
    >
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="text-gold-dark font-medium mb-1">{t('theme')}</h4>
          <p className="text-gray leading-relaxed">{data.theme}</p>
        </div>
        <div>
          <h4 className="text-gold-dark font-medium mb-1">{t('historicalBackground')}</h4>
          <p className="text-gray leading-relaxed">{data.historicalBackground}</p>
        </div>
        <div>
          <h4 className="text-gold-dark font-medium mb-1">{t('modernRelevance')}</h4>
          <p className="text-gray leading-relaxed">{data.modernRelevance}</p>
        </div>
      </div>
    </Accordion>
  )
}
