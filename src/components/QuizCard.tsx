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
            className += 'border-gold/20 bg-white text-dark hover:border-gold'
          } else if (i === question.correctIndex) {
            className += 'correct border-green-400 bg-green-50 font-medium'
          } else if (i === selectedAnswer) {
            className += 'wrong border-red-400 bg-red-50'
          } else {
            className += 'border-gray-light/20 bg-white text-gray-light opacity-60'
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={answered}
              className={className}
            >
              <span className="inline-flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center flex-shrink-0 ${
                  answered && i === question.correctIndex
                    ? 'border-green-400 bg-green-100 text-green-700'
                    : answered && i === selectedAnswer
                    ? 'border-red-400 bg-red-100 text-red-700'
                    : 'border-gold/30 text-gray'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="line-clamp-2">{option}</span>
              </span>
            </button>
          )
        })}
      </div>

      {answered && (
        <div className={`text-xs px-3 py-2 rounded-lg ${
          selectedAnswer === question.correctIndex
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {selectedAnswer === question.correctIndex
            ? t('correct')
            : `${t('theAnswerWas')} ${question.options[question.correctIndex]}`
          }
        </div>
      )}
    </div>
  )
}
