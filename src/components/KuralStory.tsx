import { useEnrichedData } from '../hooks/useEnrichedData'
import Accordion from './Accordion'

interface KuralStoryProps {
  kuralNumber: number
}

export default function KuralStory({ kuralNumber }: KuralStoryProps) {
  const { getKuralEnriched } = useEnrichedData()
  const data = getKuralEnriched(kuralNumber)

  if (!data?.story) return null

  return (
    <Accordion title={data.story.title} icon="📖">
      <div className="text-sm space-y-4">
        <blockquote className="border-l-3 border-gold/30 pl-4 py-2 bg-gold/5 rounded-r-lg">
          <p className="text-gray leading-relaxed italic">{data.story.narrative}</p>
        </blockquote>
        {data.story.culturalNote && (
          <div className="flex gap-2 text-xs text-gray-light">
            <span className="text-gold">*</span>
            <p className="leading-relaxed">{data.story.culturalNote}</p>
          </div>
        )}
      </div>
    </Accordion>
  )
}
