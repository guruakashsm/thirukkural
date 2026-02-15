import { useQuiz } from '../hooks/useQuiz'
import { useLanguage } from '../contexts/LanguageContext'
import QuizCard from './QuizCard'
import Accordion from './Accordion'
import { Link } from 'react-router-dom'

interface MiniQuizProps {
  kuralNumber: number
}

export default function MiniQuiz({ kuralNumber }: MiniQuizProps) {
  const { questions, currentIndex, answers, answer, next, isComplete, score } = useQuiz('mini', kuralNumber)
  const { t } = useLanguage()

  if (questions.length === 0) return null

  return (
    <Accordion title={t('quickQuizTitle')} icon="🧠" badge={`${questions.length} ${t('questions')}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <span className="text-xs text-gray-light">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <QuizCard
          question={questions[currentIndex]}
          selectedAnswer={answers[currentIndex]}
          onAnswer={answer}
        />

        <div className="flex items-center justify-between">
          {answers[currentIndex] !== null && !isComplete && (
            <button
              onClick={next}
              className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold-dark text-sm font-medium hover:bg-gold/20 transition-colors cursor-pointer"
            >
              {t('nextQuestion')}
            </button>
          )}
          {isComplete && (
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-gray">
                {t('score')}: <span className="font-semibold text-gold-dark">{score}/{questions.length}</span>
              </p>
              <Link
                to="/quiz"
                className="px-4 py-2 rounded-lg bg-gold text-white text-sm font-medium hover:bg-gold-dark transition-colors no-underline"
              >
                {t('tryFullQuiz')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Accordion>
  )
}
