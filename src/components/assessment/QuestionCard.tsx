'use client'

import { useMemo } from 'react'

interface QuestionCardProps {
  question: {
    id: string
    question: string
    options_json: string
    order_index: number
  }
  selectedIndex: number | undefined
  onSelect: (index: number) => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: QuestionCardProps) {
  const options: string[] = useMemo(() => {
    try {
      const parsed = JSON.parse(question.options_json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [question.options_json])

  return (
    <div className="flex flex-col h-full">
      {/* Question */}
      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full mb-4">
          Question {question.order_index + 1}
        </span>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                isSelected
                  ? 'border-emerald-600 bg-white shadow-md shadow-emerald-100'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
            >
              {/* Option label circle */}
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-500 border border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {optionLabels[index]}
              </span>

              {/* Option text */}
              <span
                className={`flex-1 text-base leading-relaxed pt-0.5 ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                }`}
              >
                {option}
              </span>

              {/* Checkmark for selected */}
              {isSelected && (
                <svg
                  className="w-5 h-5 text-emerald-600 shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            hasPrevious
              ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              : 'text-gray-300 bg-gray-50 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            hasNext
              ? 'text-white bg-gray-900 hover:bg-gray-800'
              : 'text-gray-300 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
