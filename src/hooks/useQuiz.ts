import { useState, useCallback, useMemo } from 'react'
import kuralsData from '../data/kurals.json'
import type { Kural } from './useKurals'
import type { QuizQuestion, QuizScore } from '../types/enriched'

const kurals = kuralsData as Kural[]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getSignificantWords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet',
    'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
    'if', 'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'it', 'its', 'he', 'she', 'they', 'them', 'his', 'her', 'their', 'my', 'your',
    'our', 'one', 'ones', 'also', 'about', 'up', 'out', 'then', 'there', 'here', 'over'])
  return text
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
}

function generateMissingWord(kural: Kural, rand: () => number, id: string): QuizQuestion | null {
  const words = getSignificantWords(kural.englishMeaning)
  if (words.length === 0) return null

  const targetWord = words[Math.floor(rand() * words.length)]
  const question = kural.englishMeaning.replace(
    new RegExp(`\\b${targetWord}\\b`, 'i'),
    '________'
  )

  // Get distractors from other kurals
  const distractors: string[] = []
  const used = new Set([targetWord.toLowerCase()])
  const shuffled = shuffle(kurals.filter(k => k.chapter !== kural.chapter), rand)

  for (const k of shuffled) {
    if (distractors.length >= 3) break
    const kWords = getSignificantWords(k.englishMeaning)
    for (const w of kWords) {
      if (!used.has(w.toLowerCase()) && w.length >= 3) {
        distractors.push(w)
        used.add(w.toLowerCase())
        break
      }
    }
  }

  if (distractors.length < 3) return null

  const options = shuffle([targetWord, ...distractors], rand)
  return {
    id,
    type: 'missing-word',
    question: `Fill in the blank:\n"${question}"`,
    options,
    correctIndex: options.indexOf(targetWord),
    kuralNumber: kural.number,
  }
}

function generateMatchMeaning(kural: Kural, rand: () => number, id: string): QuizQuestion {
  const distractors = shuffle(
    kurals.filter(k => k.chapter !== kural.chapter),
    rand
  ).slice(0, 3)

  const options = shuffle(
    [kural, ...distractors].map(k => k.englishMeaning.length > 100 ? k.englishMeaning.slice(0, 97) + '...' : k.englishMeaning),
    rand
  )
  const correctText = kural.englishMeaning.length > 100 ? kural.englishMeaning.slice(0, 97) + '...' : kural.englishMeaning

  return {
    id,
    type: 'match-meaning',
    question: `Which meaning matches this kural?\n\n"${kural.tamil}"`,
    options,
    correctIndex: options.indexOf(correctText),
    kuralNumber: kural.number,
  }
}

function generateQuestions(seed: number, count: number): QuizQuestion[] {
  const rand = seededRandom(seed)
  const selected = shuffle([...kurals], rand).slice(0, count * 2) // extra in case some fail
  const questions: QuizQuestion[] = []

  for (const kural of selected) {
    if (questions.length >= count) break
    const type = rand() > 0.5 ? 'missing-word' : 'match-meaning'
    const id = `${seed}-${questions.length}`

    if (type === 'missing-word') {
      const q = generateMissingWord(kural, rand, id)
      if (q) questions.push(q)
      else {
        questions.push(generateMatchMeaning(kural, rand, id))
      }
    } else {
      questions.push(generateMatchMeaning(kural, rand, id))
    }
  }

  return questions
}

function getDailySeeed(): number {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

function getScores(): QuizScore[] {
  try {
    const saved = localStorage.getItem('quiz-scores')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveScore(score: QuizScore) {
  const scores = getScores()
  // Keep only last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const filtered = scores.filter(s => new Date(s.date) >= thirtyDaysAgo)
  filtered.push(score)
  localStorage.setItem('quiz-scores', JSON.stringify(filtered))
}

function calculateStreak(): number {
  const scores = getScores().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (scores.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < scores.length; i++) {
    const scoreDate = new Date(scores[i].date)
    scoreDate.setHours(0, 0, 0, 0)
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)

    if (scoreDate.getTime() === expected.getTime()) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function useQuiz(mode: 'daily' | 'random' | 'mini', kuralNumber?: number) {
  const questionCount = mode === 'mini' ? 2 : 5

  const questions = useMemo(() => {
    if (mode === 'daily') {
      return generateQuestions(getDailySeeed(), questionCount)
    } else if (mode === 'mini' && kuralNumber) {
      // For mini quiz, use kural number as part of seed for consistency
      return generateQuestions(kuralNumber * 97, questionCount)
    } else {
      return generateQuestions(Math.floor(Math.random() * 1000000), questionCount)
    }
  }, [mode, kuralNumber, questionCount])

  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(questions.length).fill(null))
  const [currentIndex, setCurrentIndex] = useState(0)

  const answer = useCallback((optionIndex: number) => {
    setAnswers(prev => {
      if (prev[currentIndex] !== null) return prev
      const next = [...prev]
      next[currentIndex] = optionIndex
      return next
    })
  }, [currentIndex])

  const next = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, questions.length])

  const isComplete = answers.every(a => a !== null)
  const score = answers.reduce<number>((acc, a, i) => acc + (a === questions[i]?.correctIndex ? 1 : 0), 0)

  const saveQuizScore = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]!
    saveScore({ date: today, score, total: questions.length })
  }, [score, questions.length])

  const reset = useCallback((newMode?: 'random') => {
    setAnswers(new Array(questions.length).fill(null))
    setCurrentIndex(0)
    if (newMode === 'random') {
      // Force re-render with new random questions - caller should remount
    }
  }, [questions.length])

  return {
    questions,
    currentIndex,
    answers,
    answer,
    next,
    isComplete,
    score,
    streak: calculateStreak(),
    scores: getScores(),
    saveQuizScore,
    reset,
  }
}
