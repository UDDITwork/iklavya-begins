'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Target, Zap, Trophy, Users,
  GraduationCap, Briefcase, ShieldCheck, BookOpen, BarChart3,
  Building2, Award, Handshake, TrendingUp, FileText, Mic,
  MessageSquare, Compass, Layers, Star, ChevronRight,
  Play, Volume2,
} from 'lucide-react'

// ─── Organic SVG blob shape ───
const BlobShape = ({ className = '', color = '#16a34a' }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,73.1,41.6C64.8,54.2,53.8,64.9,41,72.4C28.2,79.9,13.6,84.2,-1.4,86.6C-16.4,89,-33.3,89.5,-46.3,82.3C-59.3,75.1,-68.4,60.2,-75.1,44.8C-81.8,29.4,-86.1,13.5,-85.2,0.5C-84.3,-12.5,-78.2,-22.9,-70.4,-32.4C-62.6,-41.9,-53.1,-50.5,-42,-58.1C-30.9,-65.7,-18.2,-72.3,-1.5,-69.8C15.2,-67.3,30.6,-83.6,44.7,-76.4Z"
      transform="translate(100 100)"
    />
  </svg>
)

// ─── Organic wave divider ───
const WaveDivider = ({ flip = false, color = '#f8fafc' }: { flip?: boolean; color?: string }) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 sm:h-24">
      <path
        fill={color}
        d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120 Z"
      />
    </svg>
  </div>
)

// ─── Floating particle dots ───
const FloatingParticles = ({ count = 12 }: { count?: number }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full bg-green-400/20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
)

// ─── Scroll reveal wrapper ───
const RevealSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

// ─── Animated counter ───
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 50, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (isInView) motionVal.set(target)
  }, [isInView, motionVal, target])

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>{suffix}
    </span>
  )
}

// ─── Glowing orb background ───
const GlowOrb = ({ className, color }: { className: string; color: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={{ background: color }}
    animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
  />
)

// ─── Staggered card reveal ───
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 30, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  },
}

// ─── Typewriter text ───
function TypewriterText({ texts, className = '' }: { texts: string[]; className?: string }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setIndex(p => (p + 1) % texts.length), 3000)
    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        {texts[index]}
      </motion.span>
    </AnimatePresence>
  )
}

// ─── SVG Icon Components (inline vectors, not emojis) ───
const ResumeVector = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
    <rect x="12" y="4" width="40" height="56" rx="6" className="stroke-green-700" strokeWidth="2.5" fill="#f0fdf4" />
    <circle cx="32" cy="20" r="7" className="fill-green-200 stroke-green-600" strokeWidth="1.5" />
    <rect x="20" y="32" width="24" height="2.5" rx="1.25" className="fill-green-300" />
    <rect x="22" y="38" width="20" height="2" rx="1" className="fill-green-200" />
    <rect x="22" y="43" width="16" height="2" rx="1" className="fill-green-200" />
    <rect x="22" y="48" width="18" height="2" rx="1" className="fill-green-100" />
  </svg>
)

const InterviewVector = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
    <ellipse cx="32" cy="34" rx="22" ry="18" className="fill-emerald-50 stroke-emerald-600" strokeWidth="2" />
    <circle cx="22" cy="30" r="3" className="fill-emerald-300" />
    <circle cx="32" cy="26" r="3" className="fill-green-400" />
    <circle cx="42" cy="30" r="3" className="fill-emerald-300" />
    <path d="M20 44 C24 52, 40 52, 44 44" className="stroke-emerald-500" strokeWidth="2" fill="none" strokeLinecap="round" />
    <motion.path
      d="M32 8 L32 16"
      className="stroke-green-600"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ scaleY: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <motion.circle cx="32" cy="6" r="2" className="fill-green-500" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
  </svg>
)

const SkillMatchVector = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
    <motion.path
      d="M8 48 L20 36 L28 42 L40 24 L56 16"
      className="stroke-green-600"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />
    <circle cx="56" cy="16" r="4" className="fill-green-100 stroke-green-600" strokeWidth="2" />
    <path d="M53 16 L55.5 18.5 L59 14" className="stroke-green-700" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <rect x="6" y="50" width="52" height="2" rx="1" className="fill-slate-200" />
  </svg>
)

const CareerVector = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
    <path d="M32 8 L32 56" className="stroke-slate-200" strokeWidth="2" strokeDasharray="4 3" />
    <motion.circle cx="32" cy="16" r="5" className="fill-green-100 stroke-green-600" strokeWidth="1.5"
      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0 }} />
    <motion.circle cx="32" cy="32" r="5" className="fill-emerald-100 stroke-emerald-600" strokeWidth="1.5"
      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
    <motion.circle cx="32" cy="48" r="5" className="fill-amber-100 stroke-amber-600" strokeWidth="1.5"
      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
    <motion.path d="M32 48 L32 56 L38 52" className="stroke-amber-600 fill-none" strokeWidth="2" strokeLinecap="round"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
  </svg>
)

const CertVector = () => (
  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
    <rect x="8" y="12" width="48" height="32" rx="4" className="fill-amber-50 stroke-amber-600" strokeWidth="2" />
    <path d="M20 24 L44 24" className="stroke-amber-300" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 30 L40 30" className="stroke-amber-200" strokeWidth="1.5" strokeLinecap="round" />
    <motion.circle cx="32" cy="48" r="8" className="fill-amber-100 stroke-amber-500" strokeWidth="2"
      animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
    <path d="M29 48 L31 50 L35 46" className="stroke-amber-700" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
)

// ─── Journey data ───
const journeySteps = [
  {
    step: 1, title: 'Assess', icon: BarChart3,
    desc: 'AI-powered skill and psychometric assessments identify your strengths, gaps, and career direction.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    step: 2, title: 'Learn', icon: BookOpen,
    desc: 'Adaptive AI tutor and demand-based skilling courses aligned to what companies are hiring for right now.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    step: 3, title: 'Prepare', icon: Target,
    desc: 'AI interviews (text, voice, video), ATS resume building, GD practice, and career mapping.',
    color: 'from-teal-500 to-green-600',
  },
  {
    step: 4, title: 'Match', icon: Compass,
    desc: 'AI evaluates your skills vs active job requirements — showing best-fit roles and selection probability.',
    color: 'from-green-600 to-emerald-700',
  },
  {
    step: 5, title: 'Place', icon: Trophy,
    desc: 'Verified access to 150+ MNCs through our assured placement pathway. Prepared, then introduced.',
    color: 'from-emerald-600 to-green-800',
  },
]

// ─── Feature sections data ───
const coreFeatures = [
  {
    vector: ResumeVector,
    tag: 'ATS-Verified Resume Creation',
    title: 'Your Resume Gets Seen, Not Filtered Out.',
    body: 'Most resumes fail before a recruiter even sees them. Companies use Applicant Tracking Systems (ATS) to filter candidates. If your resume does not match keywords and structure expectations, it gets rejected automatically.',
    detail: 'Our AI studies the job description carefully. It aligns your resume with required keywords, skills, and measurable achievements. It ensures formatting is ATS-friendly and role-specific. We do not create one general resume. We create resumes tailored to each job you apply for.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_03 PM.png',
    accent: 'green',
  },
  {
    vector: InterviewVector,
    tag: 'Personal Interview Preparation',
    title: 'Interviews Feel Familiar, Not Frightening.',
    body: 'Interviews are not only about knowledge. They are about communication, structure, confidence, and clarity. Our AI interview system is trained on Indian interview formats and recruiter behavior.',
    detail: 'You practice through text-based mock interviews, voice simulations, and video-based real interview scenarios. You prepare for HR interviews, technical rounds, behavioral questions, and salary negotiation discussions. The system analyzes your responses and gives structured feedback.',
    image: '/about graphics/ai interviewers.png',
    accent: 'emerald',
  },
  {
    vector: SkillMatchVector,
    tag: 'AI Skill-to-Job Matchmaking',
    title: 'Apply With Clarity, Not Confusion.',
    body: 'Many students apply to dozens of jobs without strategy. Our AI evaluates your skill set and compares it with active job requirements in the Indian market.',
    detail: 'It shows where you are strong, where you need improvement, which roles suit you best, and which applications have higher selection probability. This saves time and increases focus.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_36_04 PM.png',
    accent: 'teal',
  },
  {
    vector: CareerVector,
    tag: 'AI Career Guidance Engine',
    title: 'Direction Based on Data, Not Assumptions.',
    body: 'Choosing a career path can feel overwhelming. Instead of guessing, our AI Career Guidance Engine analyzes your skills, strengths, and market demand trends in India.',
    detail: 'It suggests practical career paths aligned with hiring growth and industry demand. You get direction based on data — not assumptions.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_58 PM.png',
    accent: 'green',
  },
]

const verifiedChecks = [
  'AI-based evaluation of resume, interviews, and skill readiness',
  'ATS-optimized, role-specific resume approval',
  'Interview performance validation (text, voice & video simulations)',
  'Skill-to-job alignment scoring',
  'Priority visibility to 150+ multinational companies & employers',
  'Employer-recognized credibility backed by IKLAVYA\'s AI model',
]

export default function StudentsPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="selection:bg-green-100 overflow-x-hidden">

      {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#FDFCF6] via-white to-green-50/30 pt-20 pb-16 overflow-hidden">
        <FloatingParticles count={15} />
        <GlowOrb className="w-[500px] h-[500px] -top-40 -right-40" color="rgba(22,163,74,0.06)" />
        <GlowOrb className="w-[400px] h-[400px] bottom-0 -left-32" color="rgba(16,185,129,0.05)" />

        {/* Organic blob accents */}
        <BlobShape className="absolute -top-20 -right-20 w-72 h-72 opacity-[0.04]" color="#16a34a" />
        <BlobShape className="absolute bottom-10 -left-16 w-56 h-56 opacity-[0.03] rotate-45" color="#059669" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50/80 border border-green-200/60 backdrop-blur-sm"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-green-800 uppercase tracking-[0.3em]">For Students</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.08] tracking-tight">
                From <span className="text-green-800">Educated</span>
                <br />to <span className="relative inline-block">
                  <span className="text-green-800 italic">Employed</span>
                  <motion.svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.8 }}>
                    <motion.path d="M0 8 Q50 2 100 8 T200 8" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.8 }} />
                  </motion.svg>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light leading-relaxed max-w-xl">
                India&apos;s Own AI Career System — Built for Indian Students. Designed for Indian Employers.
                Every year, millions of students graduate with degrees. But only a small percentage feel truly
                confident walking into interviews.
              </p>

              <p className="text-base text-slate-500 font-light leading-relaxed max-w-xl">
                The problem is not intelligence. The problem is preparation aligned to real hiring expectations.
                Most career tools available today are built for global markets. They do not understand Indian
                campus placements, Indian HR expectations, salary structures, or the competitive pressure students face here.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-3 shadow-xl shadow-green-900/20 transition-colors"
                  >
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <Link href="#features">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-2xl font-bold text-sm text-green-800 border-2 border-green-200 hover:border-green-300 hover:bg-green-50/50 transition-all"
                  >
                    Explore Features
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Orbiting ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-green-200/40"
                  style={{ margin: '-20px' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />

                {/* Main image in organic shape */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-green-900/10 border border-green-100/50">
                  <Image
                    src="/about graphics/ai interviewers.png"
                    alt="AI Career Readiness"
                    width={560}
                    height={560}
                    className="w-full h-auto object-contain"
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/10 via-transparent to-transparent" />
                </div>

                {/* Floating stat pills */}
                <motion.div
                  className="absolute -left-6 top-1/4 bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl border border-green-100/50"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">150+ MNCs</div>
                      <div className="text-[10px] text-slate-400">Employer Network</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -right-4 bottom-1/4 bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl border border-emerald-100/50"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">AI Verified</div>
                      <div className="text-[10px] text-slate-400">Job-Ready Status</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════ SECTION 2: MISSION ═══════════════════ */}
      <section className="bg-white py-16 sm:py-20 relative overflow-hidden">
        <GlowOrb className="w-[300px] h-[300px] top-10 right-10" color="rgba(16,185,129,0.04)" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="relative">
              {/* Large decorative quote mark */}
              <svg className="absolute -top-8 -left-4 w-16 h-16 text-green-100 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>

              <div className="grid md:grid-cols-2 gap-12 md:gap-16">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.4em]">IKLAVYA is Different</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug">
                    We have built our own AI model — specifically designed for{' '}
                    <span className="text-green-800">Indian youth</span> and{' '}
                    <span className="text-green-800">Indian employers</span>.
                  </h2>
                </div>
                <div className="space-y-5">
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    It understands how hiring works in India. It understands what recruiters look for.
                    It understands the gap between education and employability.
                  </p>
                  <div className="relative pl-6 border-l-[3px] border-green-600/30">
                    <p className="text-xl font-serif font-bold text-green-800 italic leading-relaxed">
                      Our mission is clear: We take you from being an educated person to becoming a
                      job-ready, employable professional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ SECTION 3: JOURNEY TIMELINE ═══════════════════ */}
      <section className="relative bg-gradient-to-b from-white via-[#FDFCF6] to-white py-16 sm:py-24 overflow-hidden">
        <FloatingParticles count={8} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-[0.4em]">Your Journey</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                From Assessment to{' '}
                <span className="relative inline-block">
                  <span className="text-green-800">Placement</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0 6 Q50 0 100 6 T200 6" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.3" />
                  </svg>
                </span>
              </h2>
            </div>
          </RevealSection>

          {/* Curved journey path */}
          <div className="relative">
            {/* Connecting SVG path (desktop) */}
            <svg className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 hidden lg:block" preserveAspectRatio="none">
              <motion.path
                d="M0 7 Q180 0 360 7 T720 7 T1080 7"
                stroke="#d1fae5"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 relative z-10">
              {journeySteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -12, scale: 1.04 }}
                  className="group"
                >
                  <div className="relative bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:border-green-200/60 transition-all duration-500 h-full">
                    {/* Step number orb */}
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Step label */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase">Step {step.step}</span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════ SECTION 4: AI JOB READINESS SUITE ═══════════════════ */}
      <section id="features" className="bg-[#FDFCF6] py-16 sm:py-24 relative overflow-hidden">
        <GlowOrb className="w-[500px] h-[500px] -top-32 -left-32" color="rgba(22,163,74,0.04)" />
        <BlobShape className="absolute top-20 right-0 w-64 h-64 opacity-[0.02] -rotate-12" color="#059669" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-6">
              <span className="text-xs font-black text-green-800 uppercase tracking-[0.4em]">Our Own AI Job Readiness Suite</span>
            </div>
            <div className="max-w-4xl mx-auto text-center mb-16 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                Everything we provide is powered by our{' '}
                <span className="text-green-800">in-house AI system</span>.
              </h2>
              <p className="text-lg text-slate-500 font-light mt-6 leading-relaxed max-w-3xl mx-auto">
                Trained on Indian hiring data, Indian job descriptions, and Indian employer expectations.
                This is not a generic global model adjusted for India. This is career intelligence built for this market.
              </p>
            </div>
          </RevealSection>

          {/* Feature showcase with tabs */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Tab selector — left column */}
            <div className="lg:col-span-4 space-y-3">
              {coreFeatures.map((feature, i) => (
                <motion.button
                  key={feature.tag}
                  onClick={() => setActiveFeature(i)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-400 group ${
                    activeFeature === i
                      ? 'bg-white shadow-xl shadow-green-900/5 border border-green-200/60 scale-[1.02]'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 transition-transform duration-300 ${activeFeature === i ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}>
                      <feature.vector />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold transition-colors ${activeFeature === i ? 'text-green-800' : 'text-slate-700'}`}>
                        {feature.tag}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{feature.title}</p>
                    </div>
                  </div>

                  {/* Active indicator bar */}
                  {activeFeature === i && (
                    <motion.div
                      layoutId="activeTab"
                      className="h-0.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full mt-4"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Feature detail — right column */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                  {/* Image */}
                  <div className="relative h-64 sm:h-80 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8 overflow-hidden">
                    <BlobShape className="absolute top-0 right-0 w-48 h-48 opacity-[0.06]" />
                    <Image
                      src={coreFeatures[activeFeature].image}
                      alt={coreFeatures[activeFeature].tag}
                      width={400}
                      height={400}
                      className="w-auto h-full max-h-[280px] object-contain relative z-10 drop-shadow-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8 sm:p-10 space-y-5">
                    <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.3em]">
                      {coreFeatures[activeFeature].tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                      {coreFeatures[activeFeature].title}
                    </h3>
                    <p className="text-base text-slate-600 font-light leading-relaxed">
                      {coreFeatures[activeFeature].body}
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {coreFeatures[activeFeature].detail}
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-2 text-green-800 font-bold text-sm group/link mt-2">
                      Get Started <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SECTION 5: MORE FEATURES GRID ═══════════════════ */}
      <section className="bg-white py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900">
                Complete Career Preparation
              </h2>
            </div>
          </RevealSection>

          <motion.div
            variants={stagger.container}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* AI Cover Letters */}
            <motion.div variants={stagger.item} whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-green-50/80 to-white rounded-3xl p-8 border border-green-100/60 hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">AI-Based Cover Letters</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Writing a strong cover letter is difficult for many students. Our AI generates customized cover letters
                based on the specific job description and your actual strengths. It uses professional, clear language
                aligned with Indian corporate expectations.
              </p>
            </motion.div>

            {/* Group Discussion */}
            <motion.div variants={stagger.item} whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-emerald-50/80 to-white rounded-3xl p-8 border border-emerald-100/60 hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Group Discussion Preparation</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Group discussions are common in Indian campus placements and corporate hiring. Our AI simulates GD
                environments and helps you learn how to enter discussions confidently, present structured points,
                respond to counter-arguments, and demonstrate leadership naturally.
              </p>
            </motion.div>

            {/* Demand-Based Skilling */}
            <motion.div variants={stagger.item} whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-teal-50/80 to-white rounded-3xl p-8 border border-teal-100/60 hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Demand-Based Skilling Courses</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We continuously analyze what Indian employers are actively hiring for. Our skilling programs focus on
                in-demand technologies, practical workplace competencies, industry-relevant tools, and market-ready
                knowledge. You learn what companies are hiring for right now.
              </p>
            </motion.div>

            {/* Certifications */}
            <motion.div variants={stagger.item} whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-amber-50/80 to-white rounded-3xl p-8 border border-amber-100/60 hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CertVector />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Verifiable Certifications</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Earn verifiable digital certificates with QR codes and micro-badges.
                Share directly to LinkedIn with tamper-proof verification. Credentials that recruiters verify.
              </p>
            </motion.div>

            {/* Assured Placement */}
            <motion.div variants={stagger.item} whileHover={{ y: -10 }}
              className="group relative bg-gradient-to-br from-green-50/80 to-emerald-50/40 rounded-3xl p-8 border border-green-100/60 hover:shadow-xl transition-all duration-500 md:col-span-2 lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Handshake className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">Assured Placement Pathway</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    We do not believe in random job applications. IKLAVYA Verified Students receive structured access
                    to 150+ multinational companies and employers. But before we connect you to opportunities, we prepare
                    you properly. We improve your resume. We train you for interviews. We help you understand negotiation.
                    We strengthen your communication. We match you intelligently to suitable roles.
                  </p>
                  <p className="text-sm font-serif font-bold text-green-800 italic">
                    You are not pushed into the market unprepared. You are verified, refined, and then introduced.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════ SECTION 6: WHY DIFFERENT ═══════════════════ */}
      <section className="bg-[#FDFCF6] py-16 sm:py-24 relative overflow-hidden">
        <FloatingParticles count={6} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-16">
              <span className="text-xs font-black text-amber-800 uppercase tracking-[0.4em]">Why IKLAVYA Is Different</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                We built our own AI system for one reason.
              </h2>
              <p className="text-lg text-slate-500 font-light mt-4 max-w-2xl mx-auto">
                To bridge the gap between Indian students and Indian employers.
              </p>
            </div>
          </RevealSection>

          {/* Understanding pills — organic layout */}
          <RevealSection>
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {[
                'Campus placement pressure',
                'Tier 2 and Tier 3 student challenges',
                'Communication confidence gaps',
                'Skill mismatch problems',
                'Competitive hiring realities',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="px-5 py-3 rounded-full bg-white shadow-md border border-slate-100 text-sm font-medium text-slate-700 hover:border-green-200 hover:shadow-lg transition-all cursor-default"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </RevealSection>

          <RevealSection>
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
              <BlobShape className="absolute -top-16 -right-16 w-48 h-48 opacity-[0.03]" />

              <div className="relative z-10">
                <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.3em]">What We Actually Do for You</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-3 mb-8">
                  We do not just give you access and leave you alone.
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: FileText, text: 'Optimize your resume', color: 'text-green-600 bg-green-50' },
                    { icon: MessageSquare, text: 'Strengthen your communication', color: 'text-emerald-600 bg-emerald-50' },
                    { icon: Mic, text: 'Improve your interview performance', color: 'text-teal-600 bg-teal-50' },
                    { icon: Target, text: 'Identify and close skill gaps', color: 'text-green-700 bg-green-50' },
                    { icon: Compass, text: 'Guide your career direction', color: 'text-emerald-700 bg-emerald-50' },
                    { icon: Briefcase, text: 'Match you strategically to opportunities', color: 'text-green-800 bg-green-50' },
                    { icon: Building2, text: 'Connect you with 150+ employers', color: 'text-emerald-800 bg-emerald-50' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-green-50/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl ${item.color.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-5 h-5 ${item.color.split(' ')[0]}`} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-base text-slate-500 font-light mt-8 leading-relaxed italic border-l-[3px] border-amber-400/40 pl-5">
                  We invest effort in your preparation. Because your first job shapes your future.
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ SECTION 7: VERIFIED STUDENT ADVANTAGE ═══════════════════ */}
      <section className="bg-white py-16 sm:py-24 relative overflow-hidden">
        <GlowOrb className="w-[400px] h-[400px] bottom-0 right-0" color="rgba(22,163,74,0.04)" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Visual */}
            <RevealSection>
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-green-100/50">
                  <Image
                    src="/about graphics/ChatGPT Image Feb 15, 2026, 07_00_30 PM.png"
                    alt="IKLAVYA Verified Student"
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Floating badge */}
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl px-5 py-4 shadow-xl text-white"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6" />
                    <div>
                      <div className="text-xs font-bold">Verified</div>
                      <div className="text-[10px] opacity-80">Employer-Ready</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </RevealSection>

            {/* Right: Content */}
            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.4em]">From Skill to Salary</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  IKLAVYA Verified
                  <br />
                  <span className="text-green-800">Student Advantage</span>
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  <strong className="text-slate-800">Earned. Evaluated. Employer-Ready.</strong>
                  <br />
                  An IKLAVYA Verified Student is not just registered on the platform — they are assessed, improved,
                  and validated through our in-house AI system built for Indian hiring standards. This verification
                  reflects structured preparation and real job readiness.
                </p>

                <div className="space-y-3 pt-2">
                  {verifiedChecks.map((check, i) => (
                    <motion.div
                      key={check}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 leading-relaxed">{check}</span>
                    </motion.div>
                  ))}
                </div>

                <p className="text-sm text-slate-500 italic font-light pt-2">
                  Verification is earned through preparation — and that is why it stands out.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#0f172a" />

      {/* ═══════════════════ SECTION 8: THE OUTCOME ═══════════════════ */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
        <FloatingParticles count={10} />
        <GlowOrb className="w-[400px] h-[400px] top-0 left-1/2 -translate-x-1/2" color="rgba(22,163,74,0.08)" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <RevealSection>
            <span className="text-xs font-black text-green-400 uppercase tracking-[0.4em]">The Outcome</span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mt-6">
              You move from
            </h2>

            {/* Transformation journey visual */}
            <div className="mt-12 space-y-0">
              {[
                { text: 'An educated graduate', color: 'from-slate-600 to-slate-500' },
                { text: 'A verified, job-ready candidate', color: 'from-green-600 to-emerald-500' },
                { text: 'A confident professional entering interviews', color: 'from-emerald-500 to-green-400' },
                { text: 'With access to real hiring opportunities', color: 'from-green-400 to-emerald-300' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative py-5"
                >
                  {i > 0 && (
                    <motion.div
                      className="w-px h-8 bg-gradient-to-b from-transparent to-green-500/40 mx-auto -mt-5 mb-2"
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                    />
                  )}
                  <div className={`inline-flex items-center gap-3 px-6 sm:px-8 py-4 rounded-full bg-gradient-to-r ${item.color} bg-opacity-20 backdrop-blur-sm border border-white/10`}>
                    <ChevronRight className="w-4 h-4 text-green-300" />
                    <span className="text-base sm:text-lg font-medium">{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-16 space-y-4"
            >
              <p className="text-xl sm:text-2xl font-serif font-bold leading-relaxed">
                Your degree shows you studied.
                <br />
                <span className="text-green-400">IKLAVYA proves you are ready.</span>
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm text-slate-400 font-light">
                <span className="px-4 py-2 rounded-full border border-slate-700">Built in India</span>
                <span className="px-4 py-2 rounded-full border border-slate-700">Built for Indian Youth</span>
                <span className="px-4 py-2 rounded-full border border-slate-700">Built for Indian Employers</span>
              </div>

              <div className="pt-8">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    className="group bg-green-600 hover:bg-green-500 text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-wide shadow-2xl shadow-green-900/30 transition-colors inline-flex items-center gap-3"
                  >
                    Begin Your Transformation
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════ SECTION 9: FOR INSTITUTIONS (preserved) ═══════════════════ */}
      <section id="institutions" className="bg-white py-16 sm:py-20 md:py-28 border-t border-slate-100 relative overflow-hidden">
        <GlowOrb className="w-[400px] h-[400px] top-32 -left-48" color="rgba(22,163,74,0.04)" />
        <GlowOrb className="w-[300px] h-[300px] bottom-32 -right-32" color="rgba(245,158,11,0.04)" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <RevealSection>
            <div className="text-center mb-16 sm:mb-20">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50/60 border border-green-200/50"
              >
                <Building2 className="w-4 h-4 text-green-800" />
                <span className="text-xs font-black text-green-800 uppercase tracking-[0.3em]">For Institutions</span>
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-6 leading-tight">
                India&apos;s AI-Powered Placement Infrastructure
                <br className="hidden sm:block" />
                for <span className="text-green-800 italic">Forward-Thinking</span> Institutions.
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed mt-6">
                Partner with us to strengthen placements, reputation &amp; employer trust.
                Today, institutions are judged not only by academic results — but by placement success,
                employer relationships, and student outcomes.
              </p>
            </div>
          </RevealSection>

          {/* Stakeholder needs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {[
              { icon: GraduationCap, label: 'Students want jobs', color: 'from-green-500 to-green-700' },
              { icon: ShieldCheck, label: 'Parents want assurance', color: 'from-amber-500 to-amber-700' },
              { icon: BookOpen, label: 'Accreditation bodies want measurable data', color: 'from-emerald-500 to-emerald-700' },
              { icon: Briefcase, label: 'Employers want job-ready candidates', color: 'from-orange-500 to-orange-700' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -10, scale: 1.04 }}
                className="bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <RevealSection>
            <div className="text-center mb-16">
              <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-green-800 italic">
                IKLAVYA partners with institutions to deliver all four.
              </p>
              <p className="text-base sm:text-lg text-slate-600 font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                We work with colleges to directly onboard students into our AI-powered Career Readiness System —
                ensuring they graduate not just with degrees, but with employability proof.
              </p>
            </div>
          </RevealSection>

          {/* Partnership + Onboarding */}
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-8 mb-16 sm:mb-24">
              <div className="bg-gradient-to-br from-green-50/40 to-white rounded-3xl p-8 sm:p-10 border border-green-100/50 space-y-6">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-[0.3em]">A Strategic Placement Partnership</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  This Is Not Competition.
                  <br />This Is <span className="text-green-800">Infrastructure Support</span>.
                </h3>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  When institutions collaborate with IKLAVYA, your placement ecosystem gains technology-backed structure,
                  employer confidence, and measurable outcomes.
                </p>
                <div className="space-y-3">
                  {[
                    'Your students get structured placement preparation',
                    'Your placement rates improve',
                    'Your employer network strengthens',
                    'Your institutional brand gains credibility',
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-2">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/40 to-white rounded-3xl p-8 sm:p-10 border border-emerald-100/50 space-y-6">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Direct Student Onboarding</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Structured &amp; Transparent
                </h3>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  We work with institutions to onboard students directly into the IKLAVYA Career System under an institutional partnership model.
                </p>
                <div className="space-y-3">
                  {[
                    'Every participating student receives AI-based readiness assessment',
                    'Skill gaps are identified early',
                    'Resume quality is standardized',
                    'Interview preparation becomes structured',
                    'Job matching becomes intelligent',
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm font-serif font-bold text-green-800 italic p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  The result? Your students enter placement season prepared — not panicked.
                </p>
              </div>
            </div>
          </RevealSection>

          {/* Partnership Benefits */}
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50/60 border border-green-200/50 text-xs font-black text-green-800 uppercase tracking-[0.3em]">
                Partnership Benefits
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-6">
                What Your Institution Gains.
              </h2>
            </div>
          </RevealSection>

          <motion.div
            variants={stagger.container}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 sm:mb-24"
          >
            {[
              { icon: Building2, color: 'from-green-500 to-green-700', title: 'Strengthening Your Placement Cell', description: 'Setting up or optimizing placement cells, creating structured placement databases, building employer communication systems, and tracking placement performance year-wise.' },
              { icon: TrendingUp, color: 'from-emerald-500 to-emerald-700', title: 'Improved Placement Rates', description: 'Our in-house AI model evaluates communication readiness, interview performance, skill-to-job alignment, and resume quality. Better preparation leads to higher shortlisting and improved offer conversion.' },
              { icon: Target, color: 'from-teal-500 to-teal-700', title: 'Employer-Aligned Training', description: 'We train students in in-demand skills, prepare them for real hiring formats, conduct AI-powered mock interviews, simulate group discussions, and improve professional communication.' },
              { icon: Handshake, color: 'from-amber-500 to-amber-700', title: 'Bringing Reputed Employers to Campus', description: 'Through our verified student model, employers gain confidence in candidate quality. This improves employer visits, campus hiring drives, and long-term corporate relationships.' },
              { icon: Zap, color: 'from-green-600 to-green-800', title: 'AI-Based Infrastructure Support', description: 'AI-proctored assessment classrooms, AI-based student performance evaluation, AI tutoring support, and structured placement data management. Measurable insights instead of assumptions.' },
              { icon: Award, color: 'from-emerald-600 to-emerald-800', title: 'NAAC & Accreditation Support', description: 'Organized placement databases, employer engagement records, skill development documentation, and structured reporting data. Supports accreditation documentation and institutional audits.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={stagger.item}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-500 space-y-5"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Why partner card */}
          <RevealSection>
            <div className="bg-gradient-to-br from-[#FDFCF6] to-green-50/20 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl border border-green-100/50">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.3em]">Why Institutions Partner With IKLAVYA</span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    We Do Not Take Students Away.
                    <br />We Help Institutions Produce <span className="text-green-800">Employable Graduates</span> at Scale.
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Increase placement readiness at scale',
                      'Strengthen employer confidence',
                      'Provide measurable performance data',
                      'Enhance institutional reputation',
                      'Build long-term employability systems',
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="space-y-5">
                  <Link href="/register" className="block">
                    <motion.div whileHover={{ scale: 1.03, y: -4 }}
                      className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-8 text-white text-center shadow-xl cursor-pointer">
                      <GraduationCap className="w-10 h-10 mx-auto mb-4 opacity-80" />
                      <h4 className="text-lg font-bold mb-2">Partner With Us</h4>
                      <p className="text-sm text-green-100/80 mb-4">Transform your placement ecosystem with AI-powered career readiness infrastructure.</p>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-green-200">
                        Get Started <ArrowRight className="w-4 h-4" />
                      </span>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  )
}
