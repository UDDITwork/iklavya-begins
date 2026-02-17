'use client'

import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import TagInput from '@/components/ui/TagInput'

const INCOME_RANGES = [
  'Below 2.5 LPA',
  '2.5 - 5 LPA',
  '5 - 10 LPA',
  '10 - 20 LPA',
  'Above 20 LPA',
  'Prefer not to say',
]

interface StepThreeProps {
  form: {
    parent_occupation: string
    siblings: string
    income_range: string
    hobbies: string[]
    interests: string[]
    strengths: string[]
    weaknesses: string[]
    languages: string[]
    career_aspiration_raw: string
  }
  onChange: (updates: Partial<StepThreeProps['form']>) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
  errors: Record<string, string>
}

export default function StepThree({ form, onChange, onSubmit, onBack, isSubmitting, errors }: StepThreeProps) {
  const inputClass =
    'w-full px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm'
  const selectClass = `${inputClass} appearance-none bg-white`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Parent&apos;s Occupation
          </label>
          <input
            type="text"
            value={form.parent_occupation}
            onChange={(e) => onChange({ parent_occupation: e.target.value })}
            placeholder="e.g., Teacher, Engineer"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Number of Siblings
          </label>
          <input
            type="text"
            value={form.siblings}
            onChange={(e) => onChange({ siblings: e.target.value })}
            placeholder="e.g., 2"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Family Income Range
        </label>
        <select
          value={form.income_range}
          onChange={(e) => onChange({ income_range: e.target.value })}
          className={selectClass}
        >
          <option value="">Select income range</option>
          {INCOME_RANGES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <TagInput
        label="Hobbies"
        tags={form.hobbies}
        onChange={(hobbies) => onChange({ hobbies })}
        placeholder="e.g., Reading, Painting, Cricket"
      />

      <TagInput
        label="Interests"
        tags={form.interests}
        onChange={(interests) => onChange({ interests })}
        placeholder="e.g., Technology, Space, Music"
      />

      <TagInput
        label="Strengths"
        tags={form.strengths}
        onChange={(strengths) => onChange({ strengths })}
        placeholder="e.g., Communication, Problem Solving"
        maxTags={5}
      />
      {errors.strengths && <p className="-mt-3 text-xs text-red-500">{errors.strengths}</p>}

      <TagInput
        label="Weaknesses"
        tags={form.weaknesses}
        onChange={(weaknesses) => onChange({ weaknesses })}
        placeholder="e.g., Public Speaking, Time Management"
        maxTags={5}
      />
      {errors.weaknesses && <p className="-mt-3 text-xs text-red-500">{errors.weaknesses}</p>}

      <TagInput
        label="Languages Known"
        tags={form.languages}
        onChange={(languages) => onChange({ languages })}
        placeholder="e.g., Hindi, English, Tamil"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Career Aspiration
        </label>
        <textarea
          value={form.career_aspiration_raw}
          onChange={(e) => onChange({ career_aspiration_raw: e.target.value })}
          placeholder="What do you dream of becoming? Tell us freely..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg border-2 border-green-800 bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Complete Setup
              <CheckCircle size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
