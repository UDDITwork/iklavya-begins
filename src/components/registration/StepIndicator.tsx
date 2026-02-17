'use client'

import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const step = i + 1
        const isCompleted = currentStep > step
        const isCurrent = currentStep === step

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-800 text-white'
                    : isCurrent
                      ? 'border-2 border-green-800 text-green-800 bg-white'
                      : 'border border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {isCompleted ? <Check size={14} /> : step}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-medium ${
                  isCurrent ? 'text-green-800' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mx-1 mt-[-12px] transition-colors duration-300 ${
                  currentStep > step ? 'bg-green-800' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
