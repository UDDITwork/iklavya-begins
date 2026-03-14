'use client'

import { useState } from 'react'
import AssessmentTimer from './AssessmentTimer'

interface AssessmentHeaderProps {
  moduleName: string
  currentQuestion: number
  totalQuestions: number
  timeRemaining: number
  onTimeUp: () => void
  onExit: () => void
}

export default function AssessmentHeader({
  moduleName,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  onTimeUp,
  onExit,
}: AssessmentHeaderProps) {
  const [showExitDialog, setShowExitDialog] = useState(false)
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          {/* Left: Exit + Module name */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowExitDialog(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 shrink-0"
              aria-label="Exit assessment"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">{moduleName}</h1>
              <p className="text-xs text-gray-500">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
            </div>
          </div>

          {/* Right: Timer */}
          <div className="shrink-0">
            <AssessmentTimer timeRemaining={timeRemaining} onTimeUp={onTimeUp} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Exit confirmation dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Exit Assessment?</h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Your progress will be lost and this attempt will be marked as incomplete. Are you sure you want to exit?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExitDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Assessment
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
