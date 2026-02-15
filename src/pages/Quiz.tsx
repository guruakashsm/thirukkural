import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuiz } from '../hooks/useQuiz'
import { useLanguage } from '../contexts/LanguageContext'
import QuizCard from '../components/QuizCard'

function QuizContent({ mode, onPlayAgain }: { mode: 'daily' | 'random'; onPlayAgain: () => void }) {
  const { questions, currentIndex, answers, answer, next, isComplete, score, streak, saveQuizScore } = useQuiz(mode)
  const { t } = useLanguage()
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(() => {
    if (!saved) {
      saveQuizScore()
      setSaved(true)
    }
  }, [saved, saveQuizScore])

  if (isComplete && !saved && mode === 'daily') {
    handleSave()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => {}}
            className={`w-3 h-3 rounded-full border-none transition-all ${
              i === currentIndex
                ? 'bg-gold scale-125'
                : answers[i] !== null
                ? answers[i] === questions[i].correctIndex
                  ? 'bg-green-400'
                  : 'bg-red-400'
                : 'bg-gold/20'
            }`}
          />
        ))}
      </div>

      {!isComplete ? (
        <>
          <QuizCard
            question={questions[currentIndex]}
            selectedAnswer={answers[currentIndex]}
            onAnswer={answer}
          />

          {answers[currentIndex] !== null && (
            <div className="flex justify-end">
              <button
                onClick={next}
                className="px-5 py-2.5 rounded-xl bg-gold text-white text-sm font-medium hover:bg-gold-dark transition-colors cursor-pointer border-none"
              >
                {currentIndex < questions.length - 1 ? t('nextQuestion') : t('seeResults')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="palm-leaf-card p-8 text-center space-y-6 animate-fade-in">
          <div className="text-5xl">
            {score === questions.length ? '🏆' : score >= 3 ? '🎉' : '📚'}
          </div>

          <div>
            <p className="text-2xl font-bold text-dark">
              {score} / {questions.length}
            </p>
            <p className="text-sm text-gray mt-1">
              {score === questions.length
                ? t('perfectScore')
                : score >= 3
                ? t('wellDone')
                : t('keepReading')}
            </p>
          </div>

          {streak > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full">
              <span>🔥</span>
              <span className="text-sm font-medium text-gold-dark">{streak} {t('dayStreak')}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onPlayAgain}
              className="px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold-dark text-sm font-medium hover:bg-gold/20 transition-colors cursor-pointer"
            >
              {t('playAgain')}
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-white border border-gold/20 text-gray text-sm hover:text-gold-dark transition-colors no-underline"
            >
              {t('home')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Quiz() {
  const [key, setKey] = useState(0)
  const [mode, setMode] = useState<'daily' | 'random'>('daily')
  const { t } = useLanguage()

  const handlePlayAgain = useCallback(() => {
    setMode('random')
    setKey(k => k + 1)
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-dark">
          {mode === 'daily' ? t('todaysQuiz') : t('quickQuiz')}
        </h1>
        <p className="text-sm text-gray mt-2">
          {mode === 'daily' ? t('todaysQuizDesc') : t('quickQuizDesc')}
        </p>
      </div>

      <QuizContent key={key} mode={mode} onPlayAgain={handlePlayAgain} />
    </div>
  )
}
