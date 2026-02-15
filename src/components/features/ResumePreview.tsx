'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles, Download, Eye, Link2, ChevronDown, ChevronUp,
  Camera, X, GripVertical, Plus, Check, AlertCircle, Lightbulb,
  Briefcase, GraduationCap, Award, Wrench, User, Mail, Phone, MapPin,
  FileText, RefreshCw
} from 'lucide-react'

/* ─── Types ─── */

interface ResumeData {
  fullName: string
  email: string
  phone: string
  location: string
  summary: string
  experience: string
  education: string
  skills: string[]
  achievements: string
  photo: string | null
}

interface ATSCategory {
  label: string
  score: number
  tip: string
}

/* ─── Constants ─── */

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    color: '#166534',
    layout: 'two-col',
    desc: 'Photo left, two-column, colored header',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    color: '#374151',
    layout: 'single',
    desc: 'Clean single column, lots of whitespace',
  },
  {
    id: 'creative',
    name: 'Creative',
    color: '#166534',
    layout: 'accent-bar',
    desc: 'Photo top-center, accent sidebar',
  },
  {
    id: 'executive',
    name: 'Executive',
    color: '#92400E',
    layout: 'classic',
    desc: 'Traditional serif layout, formal',
  },
]

const initialData: ResumeData = {
  fullName: 'Arjun Mehta',
  email: 'arjun.mehta@email.com',
  phone: '+91 98765 43210',
  location: 'Delhi, India',
  summary: 'Results-driven management graduate with strong communication, leadership, and sales skills. Proven track record of driving team performance and exceeding quarterly targets.',
  experience: 'Management Trainee at GlobalCorp\nLed cross-functional team of 8 for product launch\nAchieved 140% of quarterly sales target in Q3 2024\nStreamlined client onboarding process reducing time by 30%',
  education: 'B.Tech, IIT Delhi\nCGPA: 8.9/10 | 2021 - 2025\nMinor in Management Studies',
  skills: ['Communication', 'Leadership', 'Negotiation', 'Sales Strategy', 'Time Management', 'Public Speaking'],
  achievements: 'Best Speaker Award — Inter-college Debate Championship 2024\nLed sales team to 140% quarterly target achievement\nPublished research paper on behavioral economics',
  photo: null,
}

const atsCategories: ATSCategory[] = [
  { label: 'Keywords Match', score: 88, tip: 'Add 2 more industry-relevant keywords' },
  { label: 'Formatting', score: 92, tip: 'Formatting looks great!' },
  { label: 'Section Structure', score: 85, tip: 'Consider adding a summary section header' },
  { label: 'Content Length', score: 70, tip: 'Add 1-2 more experience bullets for optimal length' },
  { label: 'Contact Info', score: 100, tip: 'All contact information present' },
]

const suggestedSkills = [
  'Team Management', 'Data Analysis', 'Problem Solving', 'Project Management',
  'Strategic Planning', 'Stakeholder Management', 'Conflict Resolution', 'Presentation Skills',
]

const aiSuggestionTexts = [
  'Add quantifiable metrics to your experience bullets. Example: "Increased client retention by 25% through proactive relationship management."',
  'Your summary could be stronger. Lead with your biggest achievement, then mention your core skills.',
  'Consider using more action verbs: "Spearheaded", "Orchestrated", "Championed" instead of "Led" and "Did".',
]

/* ─── Sub-Components ─── */

/* Template Miniature Preview */
function TemplateMiniature({ template, active }: { template: typeof templates[0]; active: boolean }) {
  const c = template.color
  return (
    <div className="w-full h-full p-2 relative">
      {template.layout === 'two-col' && (
        <>
          <div className="absolute top-2 left-2 right-2 h-3 rounded-sm" style={{ background: c, opacity: 0.15 }} />
          <div className="absolute top-7 left-2 w-5 h-5 rounded-full" style={{ background: c, opacity: 0.2 }} />
          <div className="absolute top-7 left-9 right-2 space-y-1">
            <div className="h-1.5 rounded-full bg-gray-300 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-3/4" />
          </div>
          <div className="absolute top-16 left-2 right-2 space-y-2">
            <div className="h-1 rounded-full w-5/6" style={{ background: c, opacity: 0.3 }} />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-4/5" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full w-5/6 mt-2" style={{ background: c, opacity: 0.3 }} />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-3/4" />
          </div>
        </>
      )}
      {template.layout === 'single' && (
        <div className="space-y-2 pt-1">
          <div className="h-2 rounded-full bg-gray-300 w-3/5 mx-auto" />
          <div className="h-1 rounded-full bg-gray-200 w-2/5 mx-auto" />
          <div className="border-t border-gray-200 mt-1 pt-1 space-y-1">
            <div className="h-1 rounded-full bg-gray-300 w-1/3" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-4/5" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-1 rounded-full bg-gray-300 w-1/3" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-3/4" />
          </div>
        </div>
      )}
      {template.layout === 'accent-bar' && (
        <>
          <div className="absolute top-2 bottom-2 left-2 w-2 rounded-sm" style={{ background: c, opacity: 0.25 }} />
          <div className="absolute top-3 left-6 right-2 flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full" style={{ background: c, opacity: 0.2 }} />
            <div className="space-y-0.5 flex-1">
              <div className="h-1.5 rounded-full bg-gray-300 w-3/4" />
              <div className="h-1 rounded-full bg-gray-200 w-1/2" />
            </div>
          </div>
          <div className="absolute top-14 left-6 right-2 space-y-2">
            <div className="h-1 rounded-full w-2/5" style={{ background: c, opacity: 0.3 }} />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-4/5" />
            <div className="h-1 rounded-full w-2/5 mt-1" style={{ background: c, opacity: 0.3 }} />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-3/5" />
          </div>
        </>
      )}
      {template.layout === 'classic' && (
        <div className="pt-1 space-y-1.5">
          <div className="text-center space-y-0.5">
            <div className="h-2 rounded-full bg-gray-400 w-3/5 mx-auto" />
            <div className="h-1 rounded-full bg-gray-200 w-2/3 mx-auto" />
            <div className="border-b-2 mt-1" style={{ borderColor: c, opacity: 0.3 }} />
          </div>
          <div className="space-y-1">
            <div className="h-1 rounded-full bg-gray-300 w-2/5" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-4/5" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="h-1 rounded-full bg-gray-300 w-2/5" />
            <div className="h-1 rounded-full bg-gray-200 w-full" />
            <div className="h-1 rounded-full bg-gray-200 w-3/4" />
          </div>
        </div>
      )}
      {active && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-green-800 bg-white flex items-center justify-center">
          <Check size={10} className="text-green-800" />
        </div>
      )}
    </div>
  )
}

/* Photo Upload */
function PhotoUpload({ photo, onPhotoChange }: { photo: string | null; onPhotoChange: (p: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => onPhotoChange(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => fileRef.current?.click()}
        className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 hover:border-green-600
          flex items-center justify-center bg-gray-50 hover:bg-green-50/40 transition-all group overflow-hidden shrink-0"
      >
        {photo ? (
          <>
            <img src={photo} alt="Photo" className="w-full h-full object-cover rounded-full" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
              flex items-center justify-center rounded-full">
              <Camera size={18} className="text-white" />
            </div>
          </>
        ) : (
          <div className="text-center">
            <Camera size={20} className="text-gray-400 mx-auto mb-0.5" />
            <span className="text-[9px] text-gray-400">Add Photo</span>
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {photo && (
        <button onClick={() => onPhotoChange(null)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
          <X size={12} /> Remove
        </button>
      )}
      <p className="text-[10px] text-gray-400">JPG/PNG, max 5MB</p>
    </div>
  )
}

/* ATS Score Gauge */
function ATSGauge({ score, expanded, onToggle }: { score: number; expanded: boolean; onToggle: () => void }) {
  const circumference = 2 * Math.PI * 42
  const color = score >= 80 ? '#166534' : score >= 60 ? '#92400E' : '#991B1B'
  const bgColor = score >= 80 ? '#DCFCE7' : score >= 60 ? '#FEF3C7' : '#FEE2E2'

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
      <button onClick={onToggle} className="w-full flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="#E5E7EB" strokeWidth="6" />
            <motion.circle
              cx="48" cy="48" r="42"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[8px] text-gray-400 uppercase">ATS</span>
          </div>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-gray-900 mb-0.5">ATS Compatibility</div>
          <div className="text-xs text-gray-500">
            {score >= 80 ? 'Excellent — ready for most ATS systems' :
             score >= 60 ? 'Good — a few improvements needed' :
             'Needs work — optimize keywords and structure'}
          </div>
          <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
              {atsCategories.map((cat) => {
                const catColor = cat.score >= 80 ? '#166534' : cat.score >= 60 ? '#92400E' : '#991B1B'
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{cat.label}</span>
                      <span className="text-xs font-semibold" style={{ color: catColor }}>{cat.score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: catColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Lightbulb size={8} /> {cat.tip}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* Skill Tag Input */
function SkillTagInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setInput('')
  }

  const removeSkill = (skill: string) => {
    onChange(skills.filter(s => s !== skill))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
    }
    if (e.key === 'Backspace' && !input && skills.length) {
      removeSkill(skills[skills.length - 1])
    }
  }

  const filteredSuggestions = suggestedSkills.filter(
    s => !skills.includes(s) && (!input || s.toLowerCase().includes(input.toLowerCase()))
  )

  return (
    <div>
      <div
        className="min-h-[48px] p-2 rounded-xl bg-white border border-gray-200 flex flex-wrap gap-1.5
          focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600 transition-all cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {skills.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
            bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition-colors">
            {skill}
            <button onClick={(e) => { e.stopPropagation(); removeSkill(skill) }}
              className="text-gray-400 hover:text-red-500">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
          className="flex-1 min-w-[100px] text-sm text-gray-700 outline-none bg-transparent py-1 px-1"
        />
      </div>
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] text-gray-400 self-center mr-1">Suggested:</span>
          {filteredSuggestions.slice(0, 5).map(s => (
            <button key={s} onClick={() => addSkill(s)}
              className="px-2.5 py-1 rounded-full bg-green-50/40 text-[10px] text-green-700
                border border-green-200 hover:bg-green-50 transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* Section Editor Card */
function SectionCard({
  icon: Icon, title, children, complete,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  children: React.ReactNode
  complete?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-1 h-8 rounded-full border-l-2 border-green-800 shrink-0" />
        <Icon size={16} className="text-green-800 shrink-0" />
        <span className="text-sm font-semibold text-gray-900 flex-1 text-left">{title}</span>
        {complete && (
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={12} className="text-green-600" />
          </div>
        )}
        <div className="text-gray-400">
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* AI Suggestion Inline */
function AISuggestion({ text, onUse }: { text: string; onUse: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-green-50/40 border border-green-200 mt-2"
    >
      <div className="text-[10px] text-green-700 font-medium mb-1 flex items-center gap-1">
        <Sparkles size={10} /> AI Suggestion
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-2">{text}</p>
      <div className="flex gap-2">
        <button onClick={onUse}
          className="px-3 py-1 rounded-md border-2 border-green-800 bg-white text-green-800 text-[10px] font-medium hover:bg-green-50 transition-colors">
          Use This
        </button>
        <button className="px-3 py-1 rounded-md bg-white border border-gray-200 text-gray-500 text-[10px] hover:bg-gray-50 transition-colors flex items-center gap-1">
          <RefreshCw size={8} /> Regenerate
        </button>
      </div>
    </motion.div>
  )
}

/* Resume Document Preview */
function ResumeDocument({
  data, template, className,
}: {
  data: ResumeData
  template: typeof templates[0]
  className?: string
}) {
  const c = template.color
  return (
    <div className={className}>
      {/* Live Preview badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[10px] text-gray-400 font-medium">Live Preview</span>
      </div>

      {/* Paper container */}
      <div
        className="bg-white rounded-sm shadow-2xl border border-gray-200/60 overflow-hidden"
        style={{ aspectRatio: '1 / 1.414' }}
      >
        {/* Template-colored header bar */}
        <div className="h-2" style={{ background: c }} />

        <div className="p-5 md:p-7 text-left h-full">
          {/* Header with photo */}
          <div className="flex items-start gap-4 mb-4 pb-3 border-b" style={{ borderColor: `${c}20` }}>
            {data.photo ? (
              <img src={data.photo} alt="" className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: `${c}30` }} />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border-2 border-gray-200">
                <User size={20} className="text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">{data.fullName || 'Your Name'}</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {data.email && (
                  <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                    <Mail size={8} /> {data.email}
                  </span>
                )}
                {data.phone && (
                  <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                    <Phone size={8} /> {data.phone}
                  </span>
                )}
                {data.location && (
                  <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                    <MapPin size={8} /> {data.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>
                Professional Summary
              </h3>
              <p className="text-[9px] text-gray-600 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && (
            <div className="mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>
                Experience
              </h3>
              <p className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-line">{data.experience}</p>
            </div>
          )}

          {/* Education */}
          {data.education && (
            <div className="mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>
                Education
              </h3>
              <p className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-line">{data.education}</p>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>
                Skills
              </h3>
              <div className="flex flex-wrap gap-1">
                {data.skills.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded text-[8px] text-gray-600"
                    style={{ background: `${c}08`, border: `1px solid ${c}15` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {data.achievements && (
            <div className="mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>
                Achievements
              </h3>
              <p className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-line">{data.achievements}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


/* ─── Main Component ─── */

export default function ResumePreview() {
  const [data, setData] = useState<ResumeData>(initialData)
  const [activeTemplate, setActiveTemplate] = useState('modern')
  const [atsExpanded, setAtsExpanded] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null)
  const [savedIndicator, setSavedIndicator] = useState(false)

  const template = templates.find(t => t.id === activeTemplate) || templates[0]

  const updateField = useCallback((field: keyof ResumeData, value: string | string[] | null) => {
    setData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Auto-save indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setSavedIndicator(true)
      setTimeout(() => setSavedIndicator(false), 2000)
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  // Completion percentage
  const completionPct = Math.round(
    ([
      data.fullName, data.email, data.phone, data.location,
      data.summary, data.experience, data.education,
      data.skills.length > 0 ? 'yes' : '',
      data.achievements,
    ].filter(Boolean).length / 9) * 100
  )

  const atsScore = Math.round(
    (completionPct * 0.4) +
    (data.skills.length >= 5 ? 25 : data.skills.length * 5) +
    (data.summary ? 15 : 0) +
    (data.experience.split('\n').length >= 3 ? 15 : data.experience.split('\n').length * 5) +
    5
  )

  const triggerAISuggestion = (field: string) => {
    const idx = Math.floor(Math.random() * aiSuggestionTexts.length)
    setActiveSuggestion(field === activeSuggestion ? null : field)
  }

  return (
    <div>
      {/* Template Selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 block">
          Choose Template
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`shrink-0 w-[110px] h-[150px] rounded-xl border-2 bg-white shadow-sm
                hover:shadow-md hover:scale-[1.02] transition-all duration-200 overflow-hidden ${
                activeTemplate === t.id
                  ? 'border-green-600 shadow-green-200/30'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <TemplateMiniature template={t} active={activeTemplate === t.id} />
              <div className={`text-[10px] pb-1.5 font-medium text-center ${
                activeTemplate === t.id ? 'text-green-800' : 'text-gray-500'
              }`}>
                {t.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Auto-save indicator */}
          <AnimatePresence>
            {savedIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-green-600 flex items-center gap-1"
              >
                <Check size={10} /> Auto-saved
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Upload */}
          <SectionCard icon={Camera} title="Profile Photo" complete={!!data.photo}>
            <PhotoUpload photo={data.photo} onPhotoChange={p => updateField('photo', p)} />
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
              <AlertCircle size={8} /> Some ATS systems ignore photos. Consider your target company.
            </p>
          </SectionCard>

          {/* Contact Info */}
          <SectionCard icon={User} title="Contact Information" complete={!!(data.fullName && data.email && data.phone)}>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Full Name</label>
                <input
                  value={data.fullName}
                  onChange={e => updateField('fullName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                    focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Email</label>
                  <input
                    value={data.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                      focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Phone</label>
                  <input
                    value={data.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                      focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Location</label>
                <input
                  value={data.location}
                  onChange={e => updateField('location', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                    focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
                />
              </div>
            </div>
          </SectionCard>

          {/* Summary */}
          <SectionCard icon={FileText} title="Professional Summary" complete={!!data.summary}>
            <div className="relative">
              <textarea
                value={data.summary}
                onChange={e => updateField('summary', e.target.value)}
                rows={3}
                placeholder="A brief professional overview highlighting your key strengths..."
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                  placeholder:text-gray-400 resize-none
                  focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">{data.summary.split(' ').filter(Boolean).length} words</span>
                <button
                  onClick={() => triggerAISuggestion('summary')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-green-700
                    bg-green-50/40 hover:bg-green-50 transition-colors"
                >
                  <Sparkles size={10} /> AI Improve
                </button>
              </div>
              {activeSuggestion === 'summary' && (
                <AISuggestion
                  text={aiSuggestionTexts[1]}
                  onUse={() => setActiveSuggestion(null)}
                />
              )}
            </div>
          </SectionCard>

          {/* Experience */}
          <SectionCard icon={Briefcase} title="Experience" complete={!!data.experience}>
            <div className="relative">
              <textarea
                value={data.experience}
                onChange={e => updateField('experience', e.target.value)}
                rows={5}
                placeholder="Job Title at Company&#10;• Key achievement with quantifiable results&#10;• Another impactful bullet point"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                  placeholder:text-gray-400 resize-none
                  focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Lightbulb size={8} /> Use action verbs: Led, Managed, Developed, Achieved
                </p>
                <button
                  onClick={() => triggerAISuggestion('experience')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-green-700
                    bg-green-50/40 hover:bg-green-50 transition-colors"
                >
                  <Sparkles size={10} /> AI Improve
                </button>
              </div>
              {activeSuggestion === 'experience' && (
                <AISuggestion
                  text={aiSuggestionTexts[0]}
                  onUse={() => setActiveSuggestion(null)}
                />
              )}
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard icon={GraduationCap} title="Education" complete={!!data.education}>
            <textarea
              value={data.education}
              onChange={e => updateField('education', e.target.value)}
              rows={3}
              placeholder="Degree, Institution&#10;CGPA/Percentage | Year"
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                placeholder:text-gray-400 resize-none
                focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
            />
          </SectionCard>

          {/* Skills */}
          <SectionCard icon={Wrench} title="Skills" complete={data.skills.length >= 3}>
            <SkillTagInput skills={data.skills} onChange={s => updateField('skills', s)} />
          </SectionCard>

          {/* Achievements */}
          <SectionCard icon={Award} title="Achievements" complete={!!data.achievements}>
            <div className="relative">
              <textarea
                value={data.achievements}
                onChange={e => updateField('achievements', e.target.value)}
                rows={3}
                placeholder="Awards, recognitions, certifications..."
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700
                  placeholder:text-gray-400 resize-none
                  focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all"
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => triggerAISuggestion('achievements')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-green-700
                    bg-green-50/40 hover:bg-green-50 transition-colors"
                >
                  <Sparkles size={10} /> AI Improve
                </button>
              </div>
              {activeSuggestion === 'achievements' && (
                <AISuggestion
                  text={aiSuggestionTexts[2]}
                  onUse={() => setActiveSuggestion(null)}
                />
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right: Preview (sticky) */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* ATS Score */}
          <ATSGauge
            score={Math.min(atsScore, 100)}
            expanded={atsExpanded}
            onToggle={() => setAtsExpanded(!atsExpanded)}
          />

          {/* Resume Document */}
          <ResumeDocument data={data} template={template} />
        </div>
      </div>

    </div>
  )
}
