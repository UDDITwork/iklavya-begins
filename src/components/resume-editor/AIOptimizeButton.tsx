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
    if (!current?.trim()) {
      // User-friendly message instead of silent fail or error
      const { default: toast } = await import('react-hot-toast')
      const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      toast(`Please add your ${fieldLabel} first — AI needs some content to improve.`, {
        icon: '✏️',
        duration: 4000,
        style: { fontSize: '13px' },
      })
      return
    }

    setLoading(true)
    setSuggestion(null)
    try {
      const result = await onOptimize(field, current)
      if (result && result !== current) {
        setSuggestion(result)
      } else {
        const { default: toast } = await import('react-hot-toast')
        toast('Your content already looks good — no changes suggested.', {
          icon: '👍',
          duration: 3000,
          style: { fontSize: '13px' },
        })
      }
    } catch {
      const { default: toast } = await import('react-hot-toast')
      toast('Could not generate suggestions right now. Please try again.', {
        icon: '⏳',
        duration: 3000,
        style: { fontSize: '13px' },
      })
    }
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
      <div className="relative">
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={accept} title="Accept suggestion" className={`${btnClass} flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100 transition-colors`}>
            <Check size={iconSize} />
          </button>
          <button type="button" onClick={reject} title="Reject suggestion" className={`${btnClass} flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors`}>
            <X size={iconSize} />
          </button>
        </div>
        {/* Floating suggestion preview */}
        <div className="absolute right-0 top-8 z-50 w-72 max-h-40 overflow-y-auto bg-white border border-green-200 rounded-lg shadow-lg p-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-1.5">AI Suggestion</p>
          <p className="text-xs text-gray-700 leading-relaxed">{suggestion}</p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={accept} className="text-[10px] font-medium text-green-700 hover:underline">Accept</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={reject} className="text-[10px] font-medium text-gray-400 hover:underline">Dismiss</button>
          </div>
        </div>
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
