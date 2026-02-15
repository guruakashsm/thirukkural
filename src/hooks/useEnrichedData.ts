import chaptersEnriched from '../data/chapters-enriched.json'
import kuralsEnriched from '../data/kurals-enriched.json'
import type { ChapterEnriched, KuralEnriched } from '../types/enriched'

const chapters = chaptersEnriched as Record<string, ChapterEnriched>
const kurals = kuralsEnriched as Record<string, KuralEnriched>

export function useEnrichedData() {
  const getChapterEnriched = (chapterNumber: number): ChapterEnriched | undefined => {
    return chapters[String(chapterNumber)]
  }

  const getKuralEnriched = (kuralNumber: number): KuralEnriched | undefined => {
    return kurals[String(kuralNumber)]
  }

  const hasEnrichedContent = (kuralNumber: number): boolean => {
    return String(kuralNumber) in kurals
  }

  return { getChapterEnriched, getKuralEnriched, hasEnrichedContent }
}
