export interface ChapterEnriched {
  theme: string
  historicalBackground: string
  modernRelevance: string
}

export interface ApplicationTip {
  summary: string
  steps: string[]
}

export interface Translation {
  scholar: string
  text: string
}

export interface KuralTranslations {
  english: Translation[]
  tamil: Translation[]
}

export interface KuralStoryData {
  title: string
  narrative: string
  culturalNote: string
}

export interface KuralEnriched {
  application?: ApplicationTip
  translations?: KuralTranslations
  story?: KuralStoryData
}

export interface QuizQuestion {
  id: string
  type: 'missing-word' | 'match-meaning'
  question: string
  options: string[]
  correctIndex: number
  kuralNumber: number
}

export interface QuizScore {
  date: string
  score: number
  total: number
}

export interface QuizState {
  currentIndex: number
  answers: (number | null)[]
  isComplete: boolean
}
