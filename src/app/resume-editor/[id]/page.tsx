'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import {
  ArrowLeft, Download, Save, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Plus, Trash2, Sparkles, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ResumePreview from '@/components/resume-editor/ResumePreview'
import AIOptimizeButton from '@/components/resume-editor/AIOptimizeButton'

// ── Types ──────────────────────────────────────────────────────────────────

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string | null
  portfolio: string | null
  github: string | null
}

interface EducationEntry {
  degree: string
  institution: string
  year: string
  grade: string
  board: string | null
  stream: string
}

interface ExperienceEntry {
  title: string
  company: string
  duration: string
  location: string
  bullets: string[]
}

interface ProjectEntry {
  name: string
  description: string
  tech_stack: string[]
  bullets: string[]
}

interface CertEntry {
  name: string
  issuer: string
  year: string
}

interface ResumeData {
  personal_info: PersonalInfo
  objective: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  skills: { technical: string[]; soft: string[]; languages: string[]; tools: string[] }
  achievements: string[]
  certifications: CertEntry[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const TEMPLATES = ['professional', 'modern', 'simple', 'rendercv', 'sidebar', 'jake'] as const

// ── Section Accordion ──────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  )
}

// ── Field Label ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">{children}</label>
}

// ── Input ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Input(props: any) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all placeholder:text-gray-300 ${props.className || ''}`}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Textarea(props: any) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all placeholder:text-gray-300 resize-none"
    />
  )
}

// ── Tag Input ──────────────────────────────────────────────────────────────

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg bg-white min-h-[38px]">
      {value.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs text-green-800">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-green-400 hover:text-red-500">
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] text-sm outline-none bg-transparent placeholder:text-gray-300"
      />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [template, setTemplate] = useState('professional')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [updatedAt, setUpdatedAt] = useState('')
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { register, control, setValue, getValues, reset } = useForm<ResumeData>({
    defaultValues: emptyResume(),
  })

  // Field arrays for repeatable sections
  const educationFields = useFieldArray({ control, name: 'education' })
  const experienceFields = useFieldArray({ control, name: 'experience' })
  const projectFields = useFieldArray({ control, name: 'projects' })
  const certFields = useFieldArray({ control, name: 'certifications' })

  // Watch entire form for preview (this is fine — preview is memoized)
  const watchedData = useWatch({ control })

  // ── Load draft ──
  useEffect(() => {
    loadDraft()
  }, [id])

  async function loadDraft() {
    try {
      const res = await fetch(`/api/resume-drafts/${id}`)
      if (!res.ok) {
        toast.error('Resume not found')
        router.push('/dashboard/resume-builder')
        return
      }
      const data = await res.json()
      setTemplate(data.template)
      setUpdatedAt(data.updated_at)

      try {
        const parsed = JSON.parse(data.resume_json)
        reset(mergeWithDefaults(parsed))
      } catch {
        reset(emptyResume())
      }
    } catch {
      toast.error('Failed to load resume')
    } finally {
      setLoading(false)
    }
  }

  // ── Autosave (debounced) ──
  const triggerAutosave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        const res = await fetch(`/api/resume-drafts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_json: JSON.stringify(getValues()),
            updated_at: updatedAt,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setUpdatedAt(data.updated_at)
          setSaveStatus('saved')
          // Save to localStorage backup
          localStorage.setItem(`resume-draft-${id}`, JSON.stringify(getValues()))
        } else if (res.status === 409) {
          setSaveStatus('error')
          toast.error('This resume was edited elsewhere. Please reload.')
        } else {
          setSaveStatus('error')
        }
      } catch {
        setSaveStatus('error')
      }
    }, 1500)
  }, [id, updatedAt, getValues])

  // Trigger autosave on any form change
  useEffect(() => {
    if (!loading && updatedAt) {
      triggerAutosave()
    }
  }, [watchedData])

  // Save on tab close
  useEffect(() => {
    function handleBeforeUnload() {
      const data = JSON.stringify(getValues())
      localStorage.setItem(`resume-draft-${id}`, data)
      navigator.sendBeacon?.(
        `/api/resume-drafts/${id}`,
        new Blob([JSON.stringify({ resume_json: data, updated_at: updatedAt })], { type: 'application/json' })
      )
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [id, updatedAt, getValues])

  // ── Template change ──
  async function handleTemplateChange(t: string) {
    setTemplate(t)
    try {
      await fetch(`/api/resume-drafts/${id}/template`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: t }),
      })
    } catch { /* silent */ }
  }

  // ── Download ──
  function handleDownload() {
    window.open(`/api/resume-drafts/${id}/download`, '_blank')
  }

  // ── AI optimize callback ──
  const handleAIOptimize = useCallback(async (field: string, currentValue: string, context?: Record<string, unknown>) => {
    const res = await fetch(`/api/resume-drafts/${id}/ai-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, current_value: currentValue, context }),
    })
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    return data.optimized_value as string
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  const resumeData = (watchedData || getValues()) as ResumeData

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-gray-200 bg-white shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard/resume-builder')} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-green-700" />
            <span className="text-sm font-semibold text-gray-900">Resume Editor</span>
          </div>
          {/* Save status */}
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            {saveStatus === 'saving' && <><Loader2 size={10} className="animate-spin" /> Saving...</>}
            {saveStatus === 'saved' && <><CheckCircle2 size={10} className="text-green-500" /> Saved</>}
            {saveStatus === 'error' && <><AlertCircle size={10} className="text-red-500" /> Save failed</>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Template selector */}
          <select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-green-400"
          >
            {TEMPLATES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-800 text-white text-xs font-medium hover:bg-green-900 transition-colors">
            <Download size={13} /> Download PDF
          </button>
        </div>
      </header>

      {/* ── Mobile Tab Toggle ── */}
      <div className="sm:hidden flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${mobileTab === 'edit' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400'}`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${mobileTab === 'preview' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400'}`}
        >
          Preview
        </button>
      </div>

      {/* ── Split Screen ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Form (40%) */}
        <div className={`w-full sm:w-[42%] overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 space-y-3 ${mobileTab === 'preview' ? 'hidden sm:block' : ''}`}>

          {/* Personal Details */}
          <Section title="Personal Details" defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label>Full Name</Label>
                <Input placeholder="Rajesh Kumar" {...register('personal_info.name')} />
              </div>
              <div>
                <Label>Email</Label>
                <Input placeholder="rajesh@email.com" type="email" {...register('personal_info.email')} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="+91 98765 43210" {...register('personal_info.phone')} />
              </div>
              <div>
                <Label>Location</Label>
                <Input placeholder="Mumbai, Maharashtra" {...register('personal_info.location')} />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input placeholder="linkedin.com/in/..." {...register('personal_info.linkedin')} />
              </div>
              <div>
                <Label>GitHub</Label>
                <Input placeholder="github.com/..." {...register('personal_info.github')} />
              </div>
              <div>
                <Label>Portfolio</Label>
                <Input placeholder="yoursite.com" {...register('personal_info.portfolio')} />
              </div>
            </div>
          </Section>

          {/* Summary */}
          <Section title="Professional Summary" defaultOpen>
            <div className="relative">
              <Textarea placeholder="A brief 2-3 sentence professional summary..." {...register('objective')} />
              <div className="absolute top-1 right-1">
                <AIOptimizeButton
                  field="objective"
                  getCurrentValue={() => getValues('objective')}
                  onOptimized={(val) => setValue('objective', val)}
                  onOptimize={handleAIOptimize}
                />
              </div>
            </div>
          </Section>

          {/* Education */}
          <Section title="Education">
            {educationFields.fields.map((field, index) => (
              <div key={field.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 space-y-2 relative">
                <button type="button" onClick={() => educationFields.remove(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label>Degree / Stream</Label>
                    <Input placeholder="B.Tech Computer Science" {...register(`education.${index}.degree`)} />
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input placeholder="MIT Pune" {...register(`education.${index}.institution`)} />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input placeholder="2020 - 2024" {...register(`education.${index}.year`)} />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Input placeholder="CGPA: 8.5/10" {...register(`education.${index}.grade`)} />
                  </div>
                  <div>
                    <Label>Board</Label>
                    <Input placeholder="CBSE / State" {...register(`education.${index}.board`)} />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => educationFields.append({ degree: '', institution: '', year: '', grade: '', board: null, stream: '' })}
              className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900"
            >
              <Plus size={13} /> Add Education
            </button>
          </Section>

          {/* Experience */}
          <Section title="Experience">
            {experienceFields.fields.map((field, index) => (
              <div key={field.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 space-y-2 relative">
                <button type="button" onClick={() => experienceFields.remove(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Job Title</Label>
                    <Input placeholder="Software Intern" {...register(`experience.${index}.title`)} />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input placeholder="TCS" {...register(`experience.${index}.company`)} />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input placeholder="Jun 2023 - Aug 2023" {...register(`experience.${index}.duration`)} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input placeholder="Mumbai / Remote" {...register(`experience.${index}.location`)} />
                  </div>
                </div>
                <BulletList
                  name={`experience.${index}.bullets`}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  onOptimize={handleAIOptimize}
                  fieldType="experience_bullet"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => experienceFields.append({ title: '', company: '', duration: '', location: '', bullets: [''] })}
              className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900"
            >
              <Plus size={13} /> Add Experience
            </button>
          </Section>

          {/* Projects */}
          <Section title="Projects">
            {projectFields.fields.map((field, index) => (
              <div key={field.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 space-y-2 relative">
                <button type="button" onClick={() => projectFields.remove(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Project Name</Label>
                    <Input placeholder="E-commerce App" {...register(`projects.${index}.name`)} />
                  </div>
                  <div>
                    <Label>Tech Stack (comma-separated)</Label>
                    <Input placeholder="React, Node, MongoDB" {...register(`projects.${index}.tech_stack` as never)} />
                  </div>
                </div>
                <div className="relative">
                  <Label>Description</Label>
                  <Textarea placeholder="Built a full-stack..." {...register(`projects.${index}.description`)} />
                  <div className="absolute top-5 right-1">
                    <AIOptimizeButton
                      field="project_description"
                      getCurrentValue={() => getValues(`projects.${index}.description`)}
                      onOptimized={(val) => setValue(`projects.${index}.description`, val)}
                      onOptimize={handleAIOptimize}
                    />
                  </div>
                </div>
                <BulletList
                  name={`projects.${index}.bullets`}
                  register={register}
                  setValue={setValue}
                  getValues={getValues}
                  onOptimize={handleAIOptimize}
                  fieldType="project_bullet"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => projectFields.append({ name: '', description: '', tech_stack: [], bullets: [''] })}
              className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900"
            >
              <Plus size={13} /> Add Project
            </button>
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <SkillsSection control={control} setValue={setValue} getValues={getValues} onOptimize={handleAIOptimize} draftId={id} />
          </Section>

          {/* Achievements */}
          <Section title="Achievements">
            <AchievementsList control={control} register={register} setValue={setValue} getValues={getValues} />
          </Section>

          {/* Certifications */}
          <Section title="Certifications">
            {certFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input placeholder="Certification" {...register(`certifications.${index}.name`)} />
                <Input placeholder="Issuer" {...register(`certifications.${index}.issuer`)} />
                <Input placeholder="Year" className="w-20" {...register(`certifications.${index}.year`)} />
                <button type="button" onClick={() => certFields.remove(index)} className="text-gray-300 hover:text-red-500 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => certFields.append({ name: '', issuer: '', year: '' })}
              className="flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900"
            >
              <Plus size={13} /> Add Certification
            </button>
          </Section>

        </div>

        {/* RIGHT: Preview (58%) */}
        <div className={`flex-1 overflow-y-auto bg-gray-100 p-6 flex justify-center ${mobileTab === 'edit' ? 'hidden sm:flex' : 'flex'}`}>
          <div className="w-full max-w-[650px]">
            <ResumePreview data={resumeData} template={template} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BulletList({ name, register, setValue, getValues, onOptimize, fieldType }: {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any; setValue: any; getValues: any;
  onOptimize: (field: string, value: string, ctx?: Record<string, unknown>) => Promise<string>; fieldType: string;
}) {
  const bullets = (getValues(name) as string[]) || ['']

  return (
    <div className="space-y-1.5">
      <Label>Bullet Points</Label>
      {bullets.map((_: string, i: number) => (
        <div key={i} className="flex items-start gap-1">
          <span className="text-gray-300 text-xs mt-2.5">•</span>
          <input
            {...register(`${name}.${i}`)}
            placeholder="Developed..."
            className="flex-1 px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:border-green-400"
          />
          <AIOptimizeButton
            field={fieldType}
            getCurrentValue={() => (getValues(`${name}.${i}`) as string) || ''}
            onOptimized={(val) => setValue(`${name}.${i}`, val)}
            onOptimize={onOptimize}
            size="sm"
          />
          <button
            type="button"
            onClick={() => {
              const current = [...bullets]
              current.splice(i, 1)
              setValue(name, current.length ? current : [''])
            }}
            className="text-gray-300 hover:text-red-500 mt-1"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setValue(name, [...bullets, ''])}
        className="text-[11px] text-green-700 font-medium hover:text-green-900 flex items-center gap-1"
      >
        <Plus size={11} /> Add bullet
      </button>
    </div>
  )
}

function SkillsSection({ control, setValue, getValues, onOptimize, draftId }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; setValue: any; getValues: any;
  onOptimize: (field: string, value: string, ctx?: Record<string, unknown>) => Promise<string>; draftId: string;
}) {
  const skills = useWatch({ control, name: 'skills' as never }) as ResumeData['skills'] | undefined
  const [suggesting, setSuggesting] = useState(false)

  async function suggestSkills() {
    setSuggesting(true)
    try {
      const current = getValues('skills' as never) as ResumeData['skills']
      const allSkills = [...(current?.technical || []), ...(current?.soft || [])].join(', ')
      const result = await onOptimize('skills', allSkills, { objective: getValues('objective' as never) })
      const suggested = result.split(',').map((s: string) => s.trim()).filter(Boolean)
      const existing = current?.technical || []
      const newSkills = suggested.filter((s: string) => !existing.includes(s))
      if (newSkills.length > 0) {
        setValue('skills.technical' as never, [...existing, ...newSkills] as never)
        toast.success(`Added ${newSkills.length} skills`)
      } else {
        toast.success('No new skills to suggest')
      }
    } catch {
      toast.error('Failed to get suggestions')
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Technical Skills</Label>
          <button type="button" onClick={suggestSkills} disabled={suggesting} className="text-[10px] text-green-700 hover:text-green-900 flex items-center gap-0.5 font-medium">
            {suggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} Suggest
          </button>
        </div>
        <TagInput
          value={skills?.technical || []}
          onChange={(v) => setValue('skills.technical' as never, v as never)}
          placeholder="React, Python, Node.js..."
        />
      </div>
      <div>
        <Label>Soft Skills</Label>
        <TagInput value={skills?.soft || []} onChange={(v) => setValue('skills.soft' as never, v as never)} placeholder="Leadership, Communication..." />
      </div>
      <div>
        <Label>Languages</Label>
        <TagInput value={skills?.languages || []} onChange={(v) => setValue('skills.languages' as never, v as never)} placeholder="English, Hindi..." />
      </div>
      <div>
        <Label>Tools</Label>
        <TagInput value={skills?.tools || []} onChange={(v) => setValue('skills.tools' as never, v as never)} placeholder="Git, Docker, VS Code..." />
      </div>
    </div>
  )
}

function AchievementsList({ control, register, setValue, getValues }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; register: any; setValue: any; getValues: any;
}) {
  const achievements = (useWatch({ control, name: 'achievements' as never }) as string[]) || []

  return (
    <div className="space-y-1.5">
      {achievements.map((_: string, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-gray-300 text-xs">•</span>
          <input
            {...register(`achievements.${i}` as never)}
            placeholder="Won hackathon..."
            className="flex-1 px-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:border-green-400"
          />
          <button
            type="button"
            onClick={() => {
              const c = [...achievements]
              c.splice(i, 1)
              setValue('achievements' as never, c as never)
            }}
            className="text-gray-300 hover:text-red-500"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setValue('achievements' as never, [...achievements, ''] as never)}
        className="text-[11px] text-green-700 font-medium hover:text-green-900 flex items-center gap-1"
      >
        <Plus size={11} /> Add Achievement
      </button>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function emptyResume(): ResumeData {
  return {
    personal_info: { name: '', email: '', phone: '', location: '', linkedin: null, portfolio: null, github: null },
    objective: '',
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], languages: [], tools: [] },
    achievements: [],
    certifications: [],
  }
}

function mergeWithDefaults(data: Partial<ResumeData>): ResumeData {
  const defaults = emptyResume()
  return {
    personal_info: { ...defaults.personal_info, ...data.personal_info },
    objective: data.objective || '',
    education: data.education || [],
    experience: data.experience || [],
    projects: data.projects || [],
    skills: { ...defaults.skills, ...data.skills },
    achievements: data.achievements || [],
    certifications: data.certifications || [],
  }
}
