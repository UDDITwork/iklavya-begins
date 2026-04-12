'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, MapPin, Clock, Bookmark, BookmarkCheck,
  Share2, Loader2, Search, ArrowUp, ChevronDown, ChevronUp,
  Check, IndianRupee, Building2, SlidersHorizontal, X
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'
import { playPop } from '@/lib/sounds'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JobPost {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  experience: string
  description: string
  requirements: string[]
  postedAt: string
  sourceUrl: string
  sourceName: string
  category: string
  tags: string[]
  matchScore: number
  isApplied: boolean
  isSaved: boolean
  accentColor: string
}

interface UserProfile {
  city?: string
  state?: string
  education_level?: string
  interests?: string[]
  career_aspiration_raw?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCENT_COLORS: Record<string, string> = {
  sales: '#2563eb',
  receptionist: '#ec4899',
  'data-entry': '#06b6d4',
  'customer-support': '#8b5cf6',
  retail: '#14b8a6',
  admin: '#64748b',
  accounts: '#f59e0b',
  telecalling: '#f97316',
  marketing: '#ef4444',
  delivery: '#10b981',
  driver: '#6366f1',
  security: '#475569',
  housekeeping: '#d946ef',
  warehouse: '#0ea5e9',
  packing: '#84cc16',
  helper: '#a855f7',
  cook: '#e11d48',
  electrician: '#eab308',
  tailor: '#f472b6',
  all: '#16a34a',
}

const CATEGORY_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'sales', label: 'Sales' },
  { key: 'receptionist', label: 'Front Desk' },
  { key: 'admin', label: 'Admin' },
  { key: 'customer-support', label: 'BPO' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'retail', label: 'Retail' },
  { key: 'data-entry', label: 'Data Entry' },
  { key: 'telecalling', label: 'Telecalling' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'driver', label: 'Driver' },
  { key: 'security', label: 'Security' },
  { key: 'housekeeping', label: 'Housekeeping' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'packing', label: 'Packing' },
  { key: 'helper', label: 'Helper' },
  { key: 'cook', label: 'Cook' },
  { key: 'electrician', label: 'Electrician' },
  { key: 'tailor', label: 'Tailor' },
]

const SALARY_PRESETS = [
  { label: 'Any', min: 0, max: 0 },
  { label: 'Under ₹15K', min: 0, max: 15000 },
  { label: '₹15K–25K', min: 15000, max: 25000 },
  { label: '₹25K–40K', min: 25000, max: 40000 },
  { label: '₹40K+', min: 40000, max: 0 },
]

const EXPERIENCE_PRESETS = [
  { label: 'Any', min: -1, max: -1 },
  { label: 'Fresher', min: 0, max: 0 },
  { label: '0–1 yr', min: 0, max: 1 },
  { label: '1–3 yr', min: 1, max: 3 },
  { label: '3–5 yr', min: 3, max: 5 },
  { label: '5+ yr', min: 5, max: -1 },
]

const JOB_TYPE_OPTIONS = [
  { label: 'All Types', value: '' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'WFH', value: 'wfh' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
]

const RECENCY_OPTIONS = [
  { label: 'All Time', value: '' },
  { label: 'Last 24h', value: '1d' },
  { label: 'Last 2 days', value: '2d' },
  { label: 'Last 3 days', value: '3d' },
  { label: 'Last week', value: '1w' },
  { label: 'Last 2 weeks', value: '2w' },
  { label: 'Last month', value: '1m' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function getMatchBadge(score: number) {
  if (score >= 85) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (score >= 65) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
  return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
}

function getCompanyInitials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getAccentForJob(job: { category: string }): string {
  return ACCENT_COLORS[job.category] || ACCENT_COLORS.all
}

function cleanDescription(raw: string): string {
  let t = raw
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  t = t.replace(/https?:\/\/[^\s)"']+/g, '')
  t = t.replace(/#{1,6}\s*/g, '')
  t = t.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  const junk = [
    /Skip to (?:content|main|navigation)/gi,
    /Sort by\s*(?:Relevance|Date|Distance)\s*/gi,
    /Refine Your Search/gi,
    /(?:Show|View)\s+(?:more|less|all|details)/gi,
    /Quick apply\s*\d*[hd]?/gi, /Apply now/gi,
    /(?:Log ?in|Register|Sign ?up|Sign ?in)\b/gi,
    /For employers/gi, /Buy online/gi,
    /(?:Employer|Jobseeker)\s*(?:Login|Register)/gi,
    /All Filters/gi, /Naukri\s*(?:Talent Cloud|Logo)/gi,
    /Hiring solutions?/gi,
    /Posted by\s*(?:Company|Consultant)\s*Jobs?\s*\d*/gi,
    /Freshness\s*Select/gi, /Last \d+ days?/gi,
    /Date Added\s*[-–]\s*(?:Anytime|24 hours|\d+ days?)/gi,
    /Job Type\s*[-–]\s*All Job Types/gi,
    /Minimum Salary\s*[-–]\s*All salaries/gi,
    /(?:Sort & )?Filter\b/gi,
    /\d+\s*[-–]\s*\d+\s*of\s*\d+/gi, /Page\s*\d+/gi,
    /Company type\s*\w+/gi, /Work mode\s*\w+/gi,
    /Top companies\s*\w*/gi,
    /Industry\s+\w[\w\s&]*?\d+/gi,
    /Role category\s+\w[\w\s&]*?\d+/gi,
    /Department\s+\w[\w\s&,]*?\d+/gi,
    /Location\s+\w[\w\s/]*?\d+/gi,
    /Experience\s+Any\s+\d+\s*Yrs?/gi,
    /Any Salary[\d\s\-LakhsCrore,₹]+/gi,
    /Distance\s*\d+\s*kilometers?/gi,
    /Freshers?\s*OK/gi, /Urgent Hiring/gi,
    /Base64-Image-Removed/gi,
    /(?:transparentImg|addFilter|search-job-icon|dummy-job-logo|whiteCallIcon|chevron-down)\.\w+/gi,
    /Expand job summary/gi, /company-logo/gi,
    /Education\s+Any\s+\w+/gi,
    /Stipend\s+\w+\d+/gi, /Duration\s+\d+\s*Months?\d*/gi,
    /\+\s*\d+\s*more/gi, /checkmark/gi,
  ]
  for (const p of junk) t = t.replace(p, ' ')
  t = t.replace(/[<>[\]()]/g, ' ')
  t = t.replace(/\s*\|\s*/g, ' ')
  t = t.replace(/\s+[-–—]{2,}\s+/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  t = t.replace(/^[-–—•*.,;:\s]+/, '')
  if (t.length > 300) t = t.slice(0, 300).replace(/\s+\S*$/, '') + '...'
  return t
}

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-[3px] bg-gray-200" />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="w-6 h-6 rounded bg-gray-100" />
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-14" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 bg-gray-50 rounded-full w-16" />
          <div className="h-5 bg-gray-50 rounded-full w-20" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
        <div className="h-8 bg-gray-200 rounded-lg w-28" />
        <div className="h-8 bg-gray-100 rounded-lg w-20" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Filter Chip                                                        */
/* ------------------------------------------------------------------ */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Job Card                                                           */
/* ------------------------------------------------------------------ */

function JobCard({
  job,
  isSaved,
  isApplied,
  isExpanded,
  onToggleSave,
  onToggleExpand,
  onApply,
  onShare,
}: {
  job: JobPost
  isSaved: boolean
  isApplied: boolean
  isExpanded: boolean
  onToggleSave: () => void
  onToggleExpand: () => void
  onApply: () => void
  onShare: () => void
}) {
  const matchBadge = getMatchBadge(job.matchScore)
  const initials = getCompanyInitials(job.company)
  const cleaned = cleanDescription(job.description)
  const shortDesc = cleaned.slice(0, 140)
  const hasMoreDesc = cleaned.length > 140

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden">
      {/* Header row */}
      <div className="flex items-start gap-3 p-4 pb-0">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{job.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {job.matchScore > 0 && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${matchBadge.bg} ${matchBadge.text} ${matchBadge.border}`}>
              {job.matchScore}%
            </span>
          )}
          <button
            onClick={onToggleSave}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved ? 'text-green-700 bg-green-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-gray-500">
        {job.location && job.location !== 'India' && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" />
            {job.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Briefcase size={11} className="text-gray-400" />
          {job.type}
        </span>
        {job.experience && job.experience !== 'Fresher' && (
          <span className="text-gray-400">{job.experience}</span>
        )}
        <span className="inline-flex items-center gap-1 text-gray-400">
          <Clock size={11} />
          {timeAgo(job.postedAt)}
        </span>
      </div>

      {/* Salary */}
      {job.salary && job.salary !== 'Not disclosed' && (
        <div className="px-4 pb-2">
          <span className="text-sm font-semibold text-gray-900 inline-flex items-center gap-0.5">
            <IndianRupee size={12} />
            {job.salary}
          </span>
        </div>
      )}

      {/* Tags */}
      {job.tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {cleaned && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            {isExpanded ? cleaned : (hasMoreDesc ? shortDesc + '...' : cleaned)}
          </p>

          {/* Expanded: requirements */}
          {isExpanded && job.requirements.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">Requirements</p>
              <ul className="space-y-0.5">
                {job.requirements.slice(0, 8).map((req, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                    {cleanDescription(req)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(hasMoreDesc || job.requirements.length > 0) && (
            <button
              onClick={onToggleExpand}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1.5 font-medium inline-flex items-center gap-0.5"
            >
              {isExpanded ? (
                <>Show less <ChevronUp size={12} /></>
              ) : (
                <>View details <ChevronDown size={12} /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        {job.sourceUrl ? (
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { if (!isApplied) onApply() }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isApplied
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-white text-gray-900 border-green-600 hover:bg-green-50'
            }`}
          >
            {isApplied ? (
              <><Check size={14} /> Visited</>
            ) : (
              <>Apply on {job.sourceName || 'Source'} {'\u2192'}</>
            )}
          </a>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border bg-gray-50 text-gray-400 border-gray-200 cursor-default"
          >
            No link available
          </button>
        )}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Share2 size={14} />
          Share
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function JobFeedPage() {
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)

  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [salaryPresetIdx, setSalaryPresetIdx] = useState(0) // index into SALARY_PRESETS
  const [expPresetIdx, setExpPresetIdx] = useState(0) // index into EXPERIENCE_PRESETS
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [recencyFilter, setRecencyFilter] = useState('')

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (salaryPresetIdx > 0) count++
    if (expPresetIdx > 0) count++
    if (jobTypeFilter) count++
    if (locationFilter) count++
    if (recencyFilter) count++
    return count
  }, [salaryPresetIdx, expPresetIdx, jobTypeFilter, locationFilter, recencyFilter])

  // Fetch user profile for match scoring
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUserProfile(data) })
      .catch(() => {})
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchJobs = useCallback(async (cat: string, pg: number, search: string, append = false) => {
    if (pg === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        category: cat,
        page: String(pg),
        limit: '10',
      })
      if (search) params.set('search', search)

      // Advanced filters
      const salaryPreset = SALARY_PRESETS[salaryPresetIdx]
      if (salaryPreset && salaryPresetIdx > 0) {
        if (salaryPreset.min > 0) params.set('salary_min', String(salaryPreset.min))
        if (salaryPreset.max > 0) params.set('salary_max', String(salaryPreset.max))
      }
      const expPreset = EXPERIENCE_PRESETS[expPresetIdx]
      if (expPreset && expPresetIdx > 0) {
        if (expPreset.min >= 0) params.set('experience_min', String(expPreset.min))
        if (expPreset.max >= 0) params.set('experience_max', String(expPreset.max))
      }
      if (jobTypeFilter) params.set('job_type', jobTypeFilter)
      if (locationFilter.trim()) params.set('location', locationFilter.trim())
      if (recencyFilter) params.set('recency', recencyFilter)

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const incoming: JobPost[] = (data.jobs || []).map((job: JobPost) => ({
        ...job,
        matchScore: job.matchScore || 0,
        accentColor: ACCENT_COLORS[job.category] || ACCENT_COLORS.all,
        requirements: job.requirements || [],
      }))

      // Sync saved/applied state from backend response
      const newSaved = new Set<string>()
      const newApplied = new Set<string>()
      for (const job of incoming) {
        if (job.isSaved) newSaved.add(job.id)
        if (job.isApplied) newApplied.add(job.id)
      }

      if (append) {
        setJobs(prev => [...prev, ...incoming])
        setSavedJobs(prev => new Set([...prev, ...newSaved]))
        setAppliedJobs(prev => new Set([...prev, ...newApplied]))
      } else {
        setJobs(incoming)
        setSavedJobs(newSaved)
        setAppliedJobs(newApplied)
      }
      setHasMore(data.hasMore || false)
      setTotalCount(data.total || 0)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [salaryPresetIdx, expPresetIdx, jobTypeFilter, locationFilter, recencyFilter])

  // Re-fetch when category, search, or filters change
  useEffect(() => {
    setPage(1)
    fetchJobs(activeCategory, 1, debouncedSearch)
  }, [activeCategory, debouncedSearch, fetchJobs])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchJobs(activeCategory, nextPage, debouncedSearch, true)
        }
      },
      { threshold: 0.1 }
    )
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, activeCategory, debouncedSearch, fetchJobs])

  // Scroll to top button
  useEffect(() => {
    const container = feedRef.current?.closest('main') || feedRef.current?.parentElement
    if (!container) return
    const handleScroll = () => setShowScrollTop(container.scrollTop > 600)
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat)
    setExpandedJobs(new Set())
    feedRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearAllFilters() {
    setSalaryPresetIdx(0)
    setExpPresetIdx(0)
    setJobTypeFilter('')
    setLocationFilter('')
    setRecencyFilter('')
  }

  function toggleSave(jobId: string) {
    const wasSaved = savedJobs.has(jobId)
    // Optimistic update
    setSavedJobs(prev => {
      const next = new Set(prev)
      if (wasSaved) next.delete(jobId)
      else next.add(jobId)
      return next
    })
    if (!wasSaved) toast.success('Job saved!')

    fetch('/api/jobs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => {
        // Revert on failure
        setSavedJobs(prev => {
          const reverted = new Set(prev)
          if (wasSaved) reverted.add(jobId)
          else reverted.delete(jobId)
          return reverted
        })
        toast.error('Failed to save. Please try again.')
      })
  }

  function handleApply(jobId: string) {
    // Optimistic update
    playPop()
    setAppliedJobs(prev => new Set(prev).add(jobId))
    toast.success('Opening job posting — good luck!')

    fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
      .then(r => { if (!r.ok) throw new Error() })
      .catch(() => {
        // Revert on failure
        setAppliedJobs(prev => {
          const reverted = new Set(prev)
          reverted.delete(jobId)
          return reverted
        })
        toast.error('Failed to apply. Please try again.')
      })
  }

  async function handleShare(job: JobPost) {
    const text = `${job.title} at ${job.company} — ${job.location}\n${job.salary}\n\nApply: ${job.sourceUrl}`
    if (navigator.share) {
      try { await navigator.share({ title: job.title, text }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  const locationLabel = userProfile?.city
    ? `${userProfile.city}${userProfile.state ? ', ' + userProfile.state : ''}`
    : 'India'

  return (
    <div ref={feedRef} className="max-w-[540px] mx-auto px-4 pb-20">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#F7F8FA] pt-5 pb-3 -mx-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Jobs for you</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? '...' : `${totalCount} openings near ${locationLabel}`}
            </p>
          </div>
          {user?.profile_image ? (
            <Image
              src={user.profile_image}
              alt={user.name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
 <div className="w-9 h-9 rounded-full border border-green-200 flex items-center justify-center text-green-800 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, locations..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
          />
        </div>

        {/* Category Pills + Filter Button */}
        <div className="flex items-center gap-2 mb-2">
          <div ref={pillsRef} className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_PILLS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeCategory === cat.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              showFilters || activeFilterCount > 0
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal size={12} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-white text-gray-900 text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-3">
                {/* Salary */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Salary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SALARY_PRESETS.map((preset, idx) => (
                      <FilterChip
                        key={preset.label}
                        label={preset.label}
                        active={salaryPresetIdx === idx}
                        onClick={() => setSalaryPresetIdx(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Experience</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPERIENCE_PRESETS.map((preset, idx) => (
                      <FilterChip
                        key={preset.label}
                        label={preset.label}
                        active={expPresetIdx === idx}
                        onClick={() => setExpPresetIdx(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Job Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={jobTypeFilter === opt.value}
                        onClick={() => setJobTypeFilter(opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City</p>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi, Bangalore..."
                    className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-200"
                  />
                </div>

                {/* Recency */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Posted Within</p>
                  <div className="flex flex-wrap gap-1.5">
                    {RECENCY_OPTIONS.map((opt) => (
                      <FilterChip
                        key={opt.value}
                        label={opt.label}
                        active={recencyFilter === opt.value}
                        onClick={() => setRecencyFilter(opt.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Clear all */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    <X size={12} />
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Job Feed */}
      {!loading && (
        <div className="space-y-4 mt-4">
          <AnimatePresence mode="popLayout">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
              >
                <JobCard
                  job={job}
                  isSaved={savedJobs.has(job.id)}
                  isApplied={appliedJobs.has(job.id)}
                  isExpanded={expandedJobs.has(job.id)}
                  onToggleSave={() => toggleSave(job.id)}
                  onToggleExpand={() =>
                    setExpandedJobs(prev => {
                      const next = new Set(prev)
                      if (next.has(job.id)) next.delete(job.id)
                      else next.add(job.id)
                      return next
                    })
                  }
                  onApply={() => handleApply(job.id)}
                  onShare={() => handleShare(job)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No openings found</h3>
              <p className="text-sm text-gray-400">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try a different search.`
                  : activeFilterCount > 0
                    ? 'No jobs match your current filters. Try adjusting them.'
                    : 'No openings found for this category. Check back soon.'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Loading More */}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <Loader2 size={22} className="animate-spin text-gray-400" />
            </div>
          )}

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-4" />

          {/* End of feed */}
          {!hasMore && jobs.length > 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-300">You&apos;re all caught up!</p>
            </div>
          )}
        </div>
      )}

      {/* Scroll to top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() =>
              feedRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-20"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
