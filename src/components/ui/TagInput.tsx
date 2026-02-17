'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  label?: string
}

export default function TagInput({
  tags,
  onChange,
  placeholder = 'Type and press Enter',
  maxTags,
  label,
}: TagInputProps) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = input.trim()
      if (!value) return
      if (tags.includes(value)) return
      if (maxTags && tags.length >= maxTags) return
      onChange([...tags, value])
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {label}
          {maxTags && (
            <span className="text-gray-400 font-normal"> (max {maxTags})</span>
          )}
        </label>
      )}
      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-300 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-100 transition-all duration-200 min-h-[44px]">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-800 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-green-600 hover:text-green-900"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={maxTags ? tags.length >= maxTags : false}
          className="flex-1 min-w-[120px] outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent disabled:opacity-50"
        />
      </div>
    </div>
  )
}
