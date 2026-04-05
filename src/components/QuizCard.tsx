import { useLanguage } from '../contexts/LanguageContext'
import type { QuizQuestion } from '../types/enriched'

interface QuizCardProps {
  question: QuizQuestion
  selectedAnswer: number | null
  onAnswer: (index: number) => void
}

export default function QuizCard({ question, selectedAnswer, onAnswer }: QuizCardProps) {
  const { t } = useLanguage()
  const answered = selectedAnswer !== null

  return (
    <div className="palm-leaf-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-light">
        <span className="px-2 py-0.5 bg-gold/10 text-gold-dark rounded-full font-medium">
          {question.type === 'missing-word' ? t('fillTheBlank') : t('matchMeaning')}
        </span>
        <span>{t('kural')} #{question.kuralNumber}</span>
      </div>

      <div className="text-sm text-dark leading-relaxed whitespace-pre-line font-medium">
        {question.question}
      </div>

      <div className="space-y-2">
        {question.options.map((option, i) => {
          let className = 'quiz-option w-full text-left px-4 py-3 rounded-lg border text-sm cursor-pointer transition-all '
          if (!answered) {
            className += 'border-gold/20 bg-cream text-dark hover:border-gold'
          } else if (i === question.correctIndex) {
            className += 'correct font-medium'
          } else if (i === selectedAnswer) {
            className += 'wrong'
          } else {
            className += 'border-gray-light/20 bg-cream text-gray-light opacity-60'
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={answered}
              className={className}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full border text-xs flex items-center justify-center flex-shrink-0 border-gold/30 text-gray"
                  style={
                    answered && i === question.correctIndex
                      ? { borderColor: 'var(--color-quiz-correct)', backgroundColor: 'color-mix(in srgb, var(--color-quiz-correct) 15%, transparent)', color: 'var(--color-quiz-correct-text)' }
                      : answered && i === selectedAnswer
                      ? { borderColor: 'var(--color-quiz-wrong)', backgroundColor: 'color-mix(in srgb, var(--color-quiz-wrong) 15%, transparent)', color: 'var(--color-quiz-wrong-text)' }
                      : undefined
                  }
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="line-clamp-2">{option}</span>
              </span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={
            selectedAnswer === question.correctIndex
              ? { backgroundColor: 'color-mix(in srgb, var(--color-quiz-correct) 12%, transparent)', color: 'var(--color-quiz-correct-text)' }
              : { backgroundColor: 'color-mix(in srgb, var(--color-quiz-wrong) 12%, transparent)', color: 'var(--color-quiz-wrong-text)' }
          }
        >
          {selectedAnswer === question.correctIndex
            ? t('correct')
            : `${t('theAnswerWas')} ${question.options[question.correctIndex]}`
          }
        </div>
      )}
    </div>
  )
}
