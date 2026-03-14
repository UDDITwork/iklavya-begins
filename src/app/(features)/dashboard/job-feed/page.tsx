'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, MapPin, Clock, Bookmark, BookmarkCheck,
  Share2, Loader2, Search, ArrowUp, ChevronDown, ChevronUp,
  Check, Send, IndianRupee, Building2
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth-store'

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
  accentColor: string
}

interface Category {
  key: string
  label: string
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
  all: '#16a34a',
}

const CATEGORY_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'sales', label: 'Sales' },
  { key: 'receptionist', label: 'Front Desk' },
  { key: 'admin', label: 'Admin' },
  { key: 'customer-support', label: 'BPO / Telecaller' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'retail', label: 'Retail' },
  { key: 'data-entry', label: 'Data Entry' },
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

function getAccentForJob(job: { category: string; company: string }): string {
  return ACCENT_COLORS[job.category] || ACCENT_COLORS.all
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
  const accent = job.accentColor || getAccentForJob(job)
  const matchBadge = getMatchBadge(job.matchScore)
  const initials = getCompanyInitials(job.company)
  const shortDesc = job.description.slice(0, 100)
  const hasMoreDesc = job.description.length > 100

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Accent stripe */}
      <div className="h-[3px]" style={{ backgroundColor: accent }} />

      {/* Header row */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: accent + '22', color: accent }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug">{job.title}</h3>
            {job.matchScore > 0 && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${matchBadge.bg} ${matchBadge.text} ${matchBadge.border}`}>
                {job.matchScore}% match
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
        </div>
        <button
          onClick={onToggleSave}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isSaved ? 'text-green-700 bg-green-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
          }`}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 px-4 pb-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} className="text-gray-400" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase size={12} className="text-gray-400" />
          {job.type}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          {timeAgo(job.postedAt)}
        </span>
      </div>

      {/* Salary */}
      {job.salary && job.salary !== 'Not disclosed' && (
        <div className="px-4 pb-2">
          <span className="text-sm font-bold text-gray-900 inline-flex items-center gap-1">
            <IndianRupee size={13} className="text-gray-600" />
            {job.salary}
          </span>
        </div>
      )}

      {/* Tags */}
      {job.tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          {isExpanded ? job.description : (hasMoreDesc ? shortDesc + '...' : job.description)}
        </p>

        {/* Expanded: requirements */}
        {isExpanded && job.requirements.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Requirements</p>
            <ul className="space-y-1">
              {job.requirements.map((req, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(hasMoreDesc || job.requirements.length > 0) && (
          <button
            onClick={onToggleExpand}
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 font-medium inline-flex items-center gap-0.5"
          >
            {isExpanded ? (
              <>Show less <ChevronUp size={12} /></>
            ) : (
              <>View details <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50">
        <button
          onClick={onApply}
          disabled={isApplied}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-default"
          style={
            isApplied
              ? { backgroundColor: '#f3f4f6', color: '#9ca3af' }
              : { backgroundColor: accent, color: '#fff' }
          }
        >
          {isApplied ? (
            <><Check size={14} /> Applied</>
          ) : (
            <>Quick Apply</>
          )}
        </button>
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

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const incoming: JobPost[] = (data.jobs || []).map((job: JobPost) => ({
        ...job,
        matchScore: job.matchScore || computeMatchScore(job, userProfile),
        accentColor: ACCENT_COLORS[job.category] || ACCENT_COLORS.all,
        requirements: job.requirements || [],
      }))

      if (append) {
        setJobs(prev => [...prev, ...incoming])
      } else {
        setJobs(incoming)
      }
      setHasMore(data.hasMore || false)
      setTotalCount(data.total || 0)
    } catch {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [userProfile])

  // Re-fetch when category or search changes
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

  // Local filter: also filter already-loaded jobs by search
  const filteredJobs = useMemo(() => {
    if (!debouncedSearch) return jobs
    const q = debouncedSearch.toLowerCase()
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [jobs, debouncedSearch])

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat)
    setExpandedJobs(new Set())
    feedRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleSave(jobId: string) {
    setSavedJobs(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
        toast('Removed from saved', { icon: '🗑️' })
      } else {
        next.add(jobId)
        toast.success('Job saved!')
      }
      return next
    })
    // Fire-and-forget backend sync
    fetch('/api/jobs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }).catch(() => {})
  }

  function handleApply(jobId: string) {
    setAppliedJobs(prev => new Set(prev).add(jobId))
    toast.success('Application sent!')
    fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    }).catch(() => {})
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
            <div className="w-9 h-9 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-800 font-semibold text-sm">
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

        {/* Category Pills */}
        <div ref={pillsRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
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
            {filteredJobs.map((job, index) => (
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
          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No openings found</h3>
              <p className="text-sm text-gray-400">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try a different search.`
                  : 'No openings found for this category. Try a different filter or check back soon.'}
              </p>
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
          {!hasMore && filteredJobs.length > 0 && (
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

/* ------------------------------------------------------------------ */
/*  Client-side match scoring                                          */
/* ------------------------------------------------------------------ */

function computeMatchScore(job: JobPost, profile: UserProfile | null): number {
  if (!profile) return 0

  let score = 0
  const text = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase()

  // Location match (30 pts)
  if (profile.city && job.location.toLowerCase().includes(profile.city.toLowerCase())) {
    score += 30
  } else if (profile.state && job.location.toLowerCase().includes(profile.state.toLowerCase())) {
    score += 15
  }

  // Education match (25 pts)
  if (profile.education_level) {
    const edu = profile.education_level.toLowerCase()
    if (text.includes(edu) || text.includes('graduate') || text.includes('any degree')) {
      score += 25
    }
    if (text.includes('12th pass') || text.includes('10th pass')) {
      score += 15
    }
  }

  // Fresher boost (20 pts)
  if (text.includes('fresher') || text.includes('no experience') || text.includes('0-1')) {
    score += 20
  }

  // Interest/career match (25 pts)
  const interests = [
    ...(profile.interests || []),
    profile.career_aspiration_raw || '',
  ]
    .join(' ')
    .toLowerCase()

  if (interests) {
    const jobWords = text.split(/\s+/)
    const matchedWords = jobWords.filter((w) => w.length > 3 && interests.includes(w))
    score += Math.min(25, matchedWords.length * 5)
  }

  return Math.min(100, score)
}
