'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'

export interface FieldSchema {
  key: string
  label: string
  type?: 'text' | 'textarea'
  placeholder?: string
}

interface ArrayFieldEditorProps {
  label: string
  items: Record<string, string>[]
  onChange: (items: Record<string, string>[]) => void
  fields: FieldSchema[]
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-sm'

export default function ArrayFieldEditor({
  label,
  items,
  onChange,
  fields,
}: ArrayFieldEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  function resetForm() {
    setFormData({})
    setShowForm(false)
    setEditIndex(null)
  }

  function handleAdd() {
    setFormData({})
    setEditIndex(null)
    setShowForm(true)
  }

  function handleEdit(index: number) {
    setFormData({ ...items[index] })
    setEditIndex(index)
    setShowForm(true)
  }

  function handleDelete(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function handleSave() {
    const hasContent = fields.some((f) => formData[f.key]?.trim())
    if (!hasContent) return

    if (editIndex !== null) {
      const updated = [...items]
      updated[editIndex] = formData
      onChange(updated)
    } else {
      onChange([...items, formData])
    }
    resetForm()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        {!showForm && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* Existing items */}
      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 border border-gray-100 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item[fields[0].key] || 'Untitled'}
                  </p>
                  {fields[1] && item[fields[1].key] && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item[fields[1].key]}
                    </p>
                  )}
                  {fields[2] && item[fields[2].key] && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {item[fields[2].key]}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.key]: e.target.value })
                  }
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors"
            >
              <Check size={13} />
              {editIndex !== null ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 py-2">
          No {label.toLowerCase()} added yet.
        </p>
      )}
    </div>
  )
}
