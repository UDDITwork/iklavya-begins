'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'

interface AIOptimizeButtonProps {
  field: string
  getCurrentValue: () => string
  onOptimized: (value: string) => void
  onOptimize: (field: string, value: string, ctx?: Record<string, unknown>) => Promise<string>
  size?: 'sm' | 'md'
}

export default function AIOptimizeButton({ field, getCurrentValue, onOptimized, onOptimize, size = 'md' }: AIOptimizeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  async function handleClick() {
    const current = getCurrentValue()
    if (!current?.trim()) return

    setLoading(true)
    setSuggestion(null)
    try {
      const result = await onOptimize(field, current)
      if (result && result !== current) {
        setSuggestion(result)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  function accept() {
    if (suggestion) {
      onOptimized(suggestion)
      setSuggestion(null)
    }
  }

  function reject() {
    setSuggestion(null)
  }

  const iconSize = size === 'sm' ? 10 : 12
  const btnClass = size === 'sm'
    ? 'w-5 h-5 rounded'
    : 'w-6 h-6 rounded-md'

  if (suggestion) {
    return (
      <div className="flex items-center gap-0.5">
        <button type="button" onClick={accept} title="Accept suggestion" className={`${btnClass} flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100 transition-colors`}>
          <Check size={iconSize} />
        </button>
        <button type="button" onClick={reject} title="Reject suggestion" className={`${btnClass} flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors`}>
          <X size={iconSize} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Optimize with AI"
      className={`${btnClass} flex items-center justify-center text-gray-300 hover:text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50`}
    >
      {loading ? <Loader2 size={iconSize} className="animate-spin" /> : <Sparkles size={iconSize} />}
    </button>
  )
}
