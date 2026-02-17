'use client'

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

const EDUCATION_LEVELS = [
  'Class 8-10',
  'Class 11-12',
  'Undergraduate (UG)',
  'Postgraduate (PG)',
  'Diploma',
  'Other',
]

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other']

const STREAMS = [
  'Science (PCM)',
  'Science (PCB)',
  'Commerce',
  'Arts / Humanities',
  'Engineering',
  'Medical',
  'Law',
  'Management',
  'Other',
]

interface StepTwoProps {
  form: {
    education_level: string
    class_or_year: string
    institution: string
    board: string
    stream: string
    cgpa: string
  }
  onChange: (updates: Partial<StepTwoProps['form']>) => void
  onNext: () => void
  onBack?: () => void
  isSubmitting: boolean
  errors: Record<string, string>
}

export default function StepTwo({ form, onChange, onNext, onBack, isSubmitting, errors }: StepTwoProps) {
  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm'
  const selectClass = `${inputClass} appearance-none bg-white`

  const isSchool = form.education_level.includes('Class')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Education Level
        </label>
        <select
          value={form.education_level}
          onChange={(e) => onChange({ education_level: e.target.value })}
          className={selectClass}
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.education_level && <p className="mt-1 text-xs text-red-500">{errors.education_level}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            {isSchool ? 'Class' : 'Year / Semester'}
          </label>
          <input
            type="text"
            value={form.class_or_year}
            onChange={(e) => onChange({ class_or_year: e.target.value })}
            placeholder={isSchool ? 'e.g., 10th' : 'e.g., 3rd Year'}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Institution Name
          </label>
          <input
            type="text"
            value={form.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            placeholder="School / College name"
            className={inputClass}
          />
        </div>
      </div>

      {isSchool && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Board
          </label>
          <select
            value={form.board}
            onChange={(e) => onChange({ board: e.target.value })}
            className={selectClass}
          >
            <option value="">Select board</option>
            {BOARDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Stream / Branch
          </label>
          <select
            value={form.stream}
            onChange={(e) => onChange({ stream: e.target.value })}
            className={selectClass}
          >
            <option value="">Select stream</option>
            {STREAMS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            CGPA / Percentage
          </label>
          <input
            type="text"
            value={form.cgpa}
            onChange={(e) => onChange({ cgpa: e.target.value })}
            placeholder="e.g., 8.5 or 85%"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-green-800 bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
