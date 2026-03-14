'use client'

interface QuestionNavProps {
  total: number
  currentIndex: number
  answeredSet: Set<number>
  onNavigate: (index: number) => void
}

export default function QuestionNav({
  total,
  currentIndex,
  answeredSet,
  onNavigate,
}: QuestionNavProps) {
  const questions = Array.from({ length: total }, (_, i) => i)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Questions
        </h3>
        <span className="text-xs text-gray-500">
          {answeredSet.size}/{total} answered
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((index) => {
          const isCurrent = index === currentIndex
          const isAnswered = answeredSet.has(index)

          let className =
            'flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer '

          if (isCurrent) {
            className += 'bg-gray-900 text-white shadow-lg shadow-gray-900/25 scale-110'
          } else if (isAnswered) {
            className += 'bg-emerald-600 text-white hover:bg-emerald-700'
          } else {
            className += 'bg-white text-gray-400 border border-gray-200 hover:border-gray-400 hover:text-gray-600'
          }

          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={className}
              aria-label={`Go to question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-gray-900" />
          Current
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          Answered
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-white border border-gray-200" />
          Unanswered
        </div>
      </div>
    </div>
  )
}
