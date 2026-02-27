'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface TemplateSelectorProps {
  resumeId?: string
  currentTemplate: string
  onTemplateChange: (template: string) => void
  mode?: 'select' | 'update'
}

const templates = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Classic single-column, formal layout',
    preview: (
      <div className="w-full h-full p-2 flex flex-col gap-1.5">
        <div className="h-2.5 w-16 bg-green-800 rounded-sm mx-auto" />
        <div className="h-1 w-12 bg-gray-300 rounded-sm mx-auto" />
        <div className="h-px w-full bg-green-800 mt-1" />
        <div className="h-1.5 w-10 bg-green-800 rounded-sm" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm" />
        </div>
        <div className="h-1.5 w-10 bg-green-800 rounded-sm mt-1" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-5/6 bg-gray-200 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with green accent',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-[35%] bg-green-800 p-1.5 flex flex-col gap-1">
          <div className="h-2 w-8 bg-white/80 rounded-sm" />
          <div className="h-1 w-6 bg-white/40 rounded-sm" />
          <div className="h-1 w-6 bg-white/40 rounded-sm" />
          <div className="mt-1 space-y-0.5">
            <div className="h-1 w-8 bg-white/30 rounded-sm" />
            <div className="h-1 w-6 bg-white/30 rounded-sm" />
          </div>
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="h-1.5 w-8 bg-gray-400 rounded-sm" />
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm" />
          <div className="h-1.5 w-8 bg-gray-400 rounded-sm mt-1" />
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'Minimal, ATS-optimized',
    preview: (
      <div className="w-full h-full p-2.5 flex flex-col gap-1.5">
        <div className="h-2.5 w-14 bg-gray-800 rounded-sm mx-auto" />
        <div className="h-1 w-16 bg-gray-300 rounded-sm mx-auto" />
        <div className="mt-1.5 space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-5/6 bg-gray-200 rounded-sm" />
        </div>
        <div className="mt-1 space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-4/5 bg-gray-200 rounded-sm" />
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'rendercv',
    name: 'RenderCV Pro',
    description: 'Blue accent, ATS-parsable',
    preview: (
      <div className="w-full h-full p-2 flex flex-col gap-1.5">
        <div className="h-2.5 w-16 bg-gray-800 rounded-sm mx-auto" />
        <div className="h-1 w-20 bg-blue-700 rounded-sm mx-auto" />
        <div className="h-px w-full bg-blue-700 mt-1" />
        <div className="h-1.5 w-10 bg-blue-700 rounded-sm" />
        <div className="h-px w-full bg-blue-700" />
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <div className="h-1 w-14 bg-gray-300 rounded-sm" />
            <div className="h-1 w-6 bg-gray-200 rounded-sm" />
          </div>
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm" />
        </div>
        <div className="h-1.5 w-10 bg-blue-700 rounded-sm mt-1" />
        <div className="h-px w-full bg-blue-700" />
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-5/6 bg-gray-200 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'sidebar',
    name: 'Clean Sidebar',
    description: 'Two-column with photo & teal sidebar',
    preview: (
      <div className="w-full h-full flex">
        <div className="w-[40%] bg-teal-700 p-1.5 flex flex-col items-center gap-1">
          <div className="h-2 w-8 bg-white/80 rounded-sm" />
          <div className="w-5 h-5 rounded-full bg-white/40 mt-0.5" />
          <div className="h-1 w-6 bg-white/40 rounded-sm mt-1" />
          <div className="h-1 w-6 bg-white/30 rounded-sm" />
          <div className="mt-auto space-y-0.5">
            <div className="h-1 w-8 bg-white/30 rounded-sm" />
            <div className="h-1 w-6 bg-white/20 rounded-sm" />
          </div>
        </div>
        <div className="flex-1 bg-amber-50/50 p-1.5 flex flex-col gap-1">
          <div className="h-1.5 w-10 bg-teal-700 rounded-sm" />
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm" />
          <div className="h-1.5 w-8 bg-teal-700 rounded-sm mt-1" />
          <div className="h-1 w-full bg-gray-200 rounded-sm" />
          <div className="h-1 w-5/6 bg-gray-200 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'jake',
    name: 'Jake Classic',
    description: 'ATS classic, black & white',
    preview: (
      <div className="w-full h-full p-2 flex flex-col gap-1.5">
        <div className="h-3 w-20 bg-gray-900 rounded-sm mx-auto" />
        <div className="h-1 w-16 bg-gray-400 rounded-sm mx-auto" />
        <div className="mt-1">
          <div className="h-1.5 w-10 bg-gray-900 rounded-sm" />
          <div className="h-px w-full bg-gray-900 mt-0.5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <div className="h-1 w-14 bg-gray-800 rounded-sm" />
            <div className="h-1 w-8 bg-gray-800 rounded-sm" />
          </div>
          <div className="flex justify-between">
            <div className="h-1 w-10 bg-gray-300 rounded-sm" />
            <div className="h-1 w-6 bg-gray-300 rounded-sm" />
          </div>
          <div className="h-1 w-3/4 bg-gray-200 rounded-sm ml-2" />
        </div>
        <div className="mt-0.5">
          <div className="h-1.5 w-8 bg-gray-900 rounded-sm" />
          <div className="h-px w-full bg-gray-900 mt-0.5" />
        </div>
        <div className="space-y-0.5">
          <div className="h-1 w-full bg-gray-200 rounded-sm ml-2" />
          <div className="h-1 w-5/6 bg-gray-200 rounded-sm ml-2" />
        </div>
      </div>
    ),
  },
]

export default function TemplateSelector({
  resumeId,
  currentTemplate,
  onTemplateChange,
  mode = 'update',
}: TemplateSelectorProps) {
  const [updating, setUpdating] = useState(false)

  async function handleSelect(templateId: string) {
    if (templateId === currentTemplate || updating) return

    if (mode === 'select') {
      onTemplateChange(templateId)
      return
    }

    // update mode — PATCH API
    if (!resumeId) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/resume/${resumeId}/template`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId }),
      })

      if (res.ok) {
        onTemplateChange(templateId)
        toast.success(`Template changed to ${templateId}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update template')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {templates.map((t) => {
        const isActive = currentTemplate === t.id
        return (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            disabled={updating}
            className={`relative w-[100px] rounded-xl border-2 overflow-hidden transition-all duration-200 ${
              isActive
                ? 'border-green-600 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            } ${updating ? 'opacity-60' : ''}`}
          >
            <div className="h-[135px] bg-white">{t.preview}</div>
            <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] font-medium text-gray-700 truncate">{t.name}</p>
            </div>
            {isActive && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center">
                <Check size={12} />
              </div>
            )}
            {updating && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-green-600" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
