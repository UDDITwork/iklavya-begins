'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Mic, FileText, Trophy, MessageSquare, CheckCircle,
  ArrowRight, Target, Zap, TrendingUp, BarChart3, Quote,
  Radio, Activity, Building2, Users, Award, Clock
} from 'lucide-react'

// --- Scroll reveal wrapper ---
const RevealSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
)

// --- Animated counter for stats ---
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

// --- Visual Asset: High-Speed Interview Waveform ---
const Waveform = () => (
  <div className="flex items-center gap-1 h-12">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-green-800/20 rounded-full"
        animate={{
          height: [10, Math.random() * 40 + 10, 10],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.05
        }}
      />
    ))}
  </div>
)

// --- Hero images for carousel ---
const heroImages = ['/v1.png', '/v2.png', '/v3.png', '/v4.png', '/v5.png']
const heroLabels = [
  'Starting the Journey',
  'Discovering Potential',
  'Building Skills',
  'Growing Rapidly',
  'Career Success'
]

// --- Logo data for marquee ---
const colleges = [
  'IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore',
  'IIT Bombay', 'IIIT Hyderabad', 'DTU Delhi', 'NIT Warangal',
  'IIT Madras', 'NSUT Delhi', 'IIT Kanpur', 'IIIT Bangalore'
]

// --- Testimonial data ---
const testimonials = [
  {
    quote: "I used to freeze in every interview. After 3 weeks of AI mock interviews focusing on confidence and body language, I landed my dream role at Deloitte.",
    name: "Arjun Mehta",
    college: "NIT Trichy",
    result: "Placed at Deloitte"
  },
  {
    quote: "The live quiz arena pushed me to practice communication daily. My public speaking score went from 40th percentile to 95th. Got a direct-to-interview pass.",
    name: "Priya Sharma",
    college: "BITS Pilani",
    result: "Placed at EY"
  },
  {
    quote: "The personalized roadmap spotted my weak negotiation and teamwork skills. It shifted my entire learning path after one mock interview. Absolute game changer.",
    name: "Siddharth Rao",
    college: "IIT Madras",
    result: "Placed at McKinsey"
  }
]

export default function NewLandingPage() {
  const [activeTab, setActiveTab] = useState('interview')
  const [scrolled, setScrolled] = useState(false)
  const [currentHero, setCurrentHero] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const productFeatures: Record<string, { title: string; tag: string; desc: string; visual: React.ReactNode }> = {
    interview: {
      title: "Personal Interview Preparation (Text, Voice & Video)",
      tag: "Real-time AI",
      desc: "Interviews are about communication, structure, and confidence. Our AI is trained on Indian interview formats \u2014 HR, technical, behavioral, and salary negotiation. Practice through text, voice, and video with structured feedback.",
      visual: (
        <div className="bg-white rounded-xl p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-mono">LATENCY: 184ms</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-mono font-bold">STABILITY: 99.9%</div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-center bg-green-50/40 p-3 rounded-lg border border-green-200">
              <div className="w-10 h-10 rounded-full border-2 border-green-800 flex items-center justify-center">
                <Mic className="text-green-800 w-5 h-5" />
              </div>
              <Waveform />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-[11px] text-green-800 font-mono mb-2">AI LIVE ANALYSIS:</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                &quot;Subject shows strong <span className="text-orange-500 font-bold">Communication Clarity</span>. Suggesting deeper focus on <span className="text-orange-500 font-bold">Confident Body Language</span> and eye contact.&quot;
              </p>
            </div>
          </div>
        </div>
      )
    },
    resume: {
      title: "ATS-Verified Resume Creation",
      tag: "ATS Domination",
      desc: "Most resumes fail before a recruiter ever sees them. ATS filters reject candidates silently. Our AI aligns your resume with the right keywords, skills, and achievements \u2014 tailored per job description.",
      visual: (
        <div className="bg-white rounded-xl p-6 shadow-2xl border border-slate-200">
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded text-[11px] text-red-700 line-through opacity-50">
              &quot;Responsible for managing a team and doing sales.&quot;
            </div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-3 bg-emerald-50 border border-emerald-100 rounded text-[11px] text-emerald-700 font-bold"
            >
              &quot;Spearheaded a cross-functional team of 12, increasing quarterly revenue by 34% through AI-driven lead generation.&quot;
            </motion.div>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400">ATS Score Improvement</span>
              <span className="text-xl font-bold text-emerald-600">+45%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "40%" }}
                animate={{ width: "85%" }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      )
    },
    guidance: {
      title: "Personalized Growth Roadmap",
      tag: "Career GPS",
      desc: "Our AI analyzes your skills, strengths, and market demand trends to suggest practical career paths. A step-by-step growth roadmap toward your target role, aligned with what employers actually need.",
      visual: (
        <div className="bg-white rounded-xl p-6 shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Your Roadmap</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">78% Complete</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
            <motion.div initial={{ width: "0%" }} animate={{ width: "78%" }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-amber-500 via-green-500 to-emerald-500 rounded-full" />
          </div>
          {/* Milestone steps */}
          <div className="space-y-3">
            {[
              { step: "Communication Basics", status: "done", color: "bg-emerald-500" },
              { step: "Active Listening", status: "done", color: "bg-emerald-500" },
              { step: "Negotiation Tactics", status: "current", color: "border-2 border-green-800" },
              { step: "Conflict Resolution", status: "upcoming", color: "bg-slate-200" },
              { step: "Team Leadership", status: "upcoming", color: "bg-slate-200" }
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${m.color} ${m.status === 'current' ? 'ring-4 ring-green-100' : ''} flex-shrink-0`} />
                <div className={`flex-1 text-xs font-bold ${m.status === 'done' ? 'text-slate-400 line-through' : m.status === 'current' ? 'text-green-800' : 'text-slate-300'}`}>{m.step}</div>
                {m.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                {m.status === 'current' && <span className="text-[9px] font-black text-green-800 bg-green-50/40 px-2 py-0.5 rounded">IN PROGRESS</span>}
              </div>
            ))}
          </div>
          {/* Target */}
          <div className="mt-5 p-3 bg-amber-50/50 rounded-lg border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-amber-800 uppercase">Target Role</p>
              <p className="text-sm font-bold text-slate-800">Team Leader</p>
            </div>
            <Target className="w-5 h-5 text-amber-700" />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="bg-[#FDFCF6] font-sans text-slate-900 selection:bg-green-100">

      {/* Marquee CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ===== 1. HERO ===== */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-[120%] -skew-x-12 translate-x-32 -z-10" />
        <RevealSection>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-block px-4 py-2 bg-stone-100 rounded-full">
                <p className="text-[10px] font-black text-stone-700 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Live Competition Starts in 04:12:00
                </p>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif font-bold text-slate-900 leading-tight sm:leading-[0.85] tracking-tight">
                From Educated to <br /> <span className="text-green-800 italic">Employed</span> &mdash; India&apos;s Own <br /> AI <span className="text-green-800 italic">Career System</span>.
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-xl leading-relaxed">
                Built for Indian Students. Designed for Indian Employers. Every year, millions graduate &mdash; but only a small percentage feel truly ready for interviews. The problem isn&apos;t intelligence, it&apos;s preparation aligned to real hiring expectations. <span className="text-green-800 font-bold italic">iKlavya</span> is different &mdash; our own AI model, built for Indian youth and Indian employers.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link href="/register">
                  <button className="px-6 sm:px-10 py-4 sm:py-5 w-full sm:w-auto text-center justify-center border-2 border-green-800 text-green-800 hover:bg-green-50/50 font-black uppercase text-xs tracking-widest rounded-lg flex items-center gap-3 shadow-lg shadow-green-200/30 transition-all">
                    Get Started Free <Zap className="w-4 h-4 text-amber-500" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-6 sm:px-10 py-4 sm:py-5 w-full sm:w-auto text-center justify-center border-2 border-slate-200 text-slate-700 font-black uppercase text-xs tracking-widest rounded-lg hover:bg-slate-50 transition-all">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHero}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Image
                      src={heroImages[currentHero]}
                      alt={heroLabels[currentHero]}
                      width={500}
                      height={500}
                      className="w-full h-auto"
                      priority={currentHero === 0}
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentHero(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentHero ? 'bg-green-800 w-6' : 'bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-[10px] font-black text-stone-500 uppercase tracking-widest mt-3">
                  {heroLabels[currentHero]}
                </p>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 2. LOGO MARQUEE ===== */}
      <section className="py-10 bg-gray-50/80 border-y border-gray-100 overflow-hidden">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">
          Trusted by students from
        </p>
        <div className="relative">
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 40s linear infinite' }}>
            {[...colleges, ...colleges].map((name, i) => (
              <div key={i} className="inline-flex items-center mx-4 sm:mx-8 shrink-0">
                <div className="w-2 h-2 rounded-full bg-stone-400 mr-3" />
                <span className="text-sm font-bold text-slate-500 tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. CORE ENGINE SHOWDOWN ===== */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-white relative">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-sm font-black text-green-800 uppercase tracking-[0.4em] mb-4">Our Own AI Job Readiness Suite</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold">Everything Powered by In-House AI, Trained on Indian Hiring Data.</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12 items-start">
              <div className="lg:col-span-4 space-y-4">
                {Object.entries(productFeatures).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full text-left p-6 rounded-xl transition-all border-2 ${activeTab === key ? 'bg-white border-green-800 shadow-xl shadow-green-100/50 translate-x-4' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === key ? 'text-green-800' : 'text-green-800'}`}>{value.tag}</span>
                      {activeTab === key && <Zap className="w-4 h-4 text-amber-500" />}
                    </div>
                    <h4 className={`text-lg font-bold mb-2 ${activeTab === key ? 'text-slate-900' : 'text-slate-900'}`}>{value.title}</h4>
                    <p className={`text-xs ${activeTab === key ? 'text-slate-600' : 'text-slate-500'}`}>{value.desc}</p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 flex items-center justify-center p-12 bg-slate-50 rounded-3xl min-h-[500px] border border-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="w-full max-w-2xl"
                  >
                    {productFeatures[activeTab].visual}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 4. HOW IT WORKS ===== */}
      <section className="py-14 sm:py-20 md:py-28 bg-[#FDFCF6]">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">The Process</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold">How Iklavya Works</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-stone-400 via-amber-300 to-emerald-300" />

              {[
                { step: 1, icon: <Mic className="w-6 h-6" />, title: "Take AI Interview", desc: "Practice through text, voice, and video interviews trained on Indian hiring formats \u2014 HR, technical, behavioral, and salary negotiation.", color: "border-2 border-green-800", textColor: "text-green-800", delay: 0 },
                { step: 2, icon: <BarChart3 className="w-6 h-6" />, title: "Get Skill Analysis", desc: "Our AI evaluates your skills vs active job requirements \u2014 showing strengths, gaps, best-fit roles, and selection probability.", color: "border-2 border-amber-700", textColor: "text-amber-700", delay: 0.15 },
                { step: 3, icon: <Target className="w-6 h-6" />, title: "Get Placed", desc: "IKLAVYA Verified Students get access to 150+ MNCs. We prepare you first \u2014 resume, interviews, communication, skill matching \u2014 then introduce you.", color: "border-2 border-emerald-700", textColor: "text-emerald-700", delay: 0.3 }
              ].map((s) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: s.delay }}
                  className="relative text-center"
                >
                  <div className="flex flex-col items-center space-y-5">
                    <div className={`${s.color} bg-white w-14 h-14 rounded-2xl flex items-center justify-center ${s.textColor} shadow-lg relative z-10`}>
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Step {s.step}</span>
                    <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 5. LIVE ARENA ===== */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-slate-50 overflow-hidden">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 items-center">
              <div className="relative">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden shadow-lg">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-800">Live Arena: Communication Challenge</span>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-200">14,203 LIVE</div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { name: "Arjun K.", score: "2840 pts", rank: 1, color: "text-amber-500" },
                      { name: "Priya M.", score: "2790 pts", rank: 2, color: "text-slate-500" },
                      { name: "Siddharth", score: "2650 pts", rank: 3, color: "text-orange-500" }
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4">
                          <span className={`font-serif italic font-bold text-xl ${user.color}`}>#{user.rank}</span>
                          <div>
                            <p className="font-bold text-sm text-slate-800">{user.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase">NIT Trichy</p>
                          </div>
                        </div>
                        <span className="font-mono text-amber-600 font-semibold">{user.score}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-4 border-2 border-green-800 rounded-lg text-center font-black uppercase text-xs tracking-widest text-green-800">
                    Next Quiz Starts in 12:45
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Live Competitions</h2>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight text-slate-900">Prove Your Worth <br /> on the National Stage.</h3>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Don&apos;t just claim skills. Prove them. Compete in live quiz broadcasts, group discussion practice, and communication challenges. Top performers get direct job assistance and &quot;Direct-to-Interview&quot; passes from our 150+ employer partners.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Trophy className="text-orange-500 w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-900">Live Broadcasts</h5>
                    <p className="text-xs text-slate-500">Interact with experts in real-time quiz formats.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-green-50/40 rounded-lg flex items-center justify-center">
                      <Building2 className="text-green-800 w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-900">Job Assistance</h5>
                    <p className="text-xs text-slate-500">Curated hiring pipelines connecting top performers to 150+ MNCs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 6. STATS COUNTER STRIP ===== */}
      <section className="py-12 sm:py-16 md:py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            {[
              { target: 520, suffix: '+', label: 'Students Trained', color: 'text-green-800' },
              { target: 150, suffix: '+', label: 'Employer Partners', color: 'text-emerald-600' },
              { target: 3200, suffix: '+', label: 'Interviews Simulated', color: 'text-orange-500' },
              { target: 99.9, suffix: '%', label: 'Platform Uptime', color: 'text-amber-800', isDecimal: true }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 ${stat.color}`}>
                  {stat.isDecimal ? (
                    <span>99.9%</span>
                  ) : (
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  )}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. PERSONALIZED LEARNING ===== */}
      <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#FDFCF6]">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-10">
                <h2 className="text-sm font-black text-amber-800 uppercase tracking-[0.4em]">Personalized Learning</h2>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight">Demand-Based <br /> Skilling Courses.</h3>
                <p className="text-lg text-slate-600 font-light">
                  Our courses focus on in-demand technologies, practical workplace competencies, and industry-relevant tools &mdash; not outdated syllabus content. Every lesson adapts based on your assessment performance. If you struggle with confidence, we inject communication modules. If you lack workplace skills, we build leadership and negotiation labs into your path.
                </p>
                <div className="space-y-4">
                  {["Dynamic Course Shifting", "Live 24/7 Expert Support", "Project-Based Learning", "Industry-Mentor Reviews"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-500 w-5 h-5" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/ai-courses" className="text-green-800 font-black uppercase text-xs tracking-widest flex items-center gap-2 group">
                  Explore Our Module Catalog <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {[
                  { label: "Communication", icon: <MessageSquare />, color: "border-2 border-green-800", textColor: "text-green-800" },
                  { label: "Negotiation", icon: <Users />, color: "border-2 border-orange-600", textColor: "text-orange-600" },
                  { label: "Leadership", icon: <Award />, color: "border-2 border-stone-600", textColor: "text-stone-600" },
                  { label: "Time Mgmt", icon: <Clock />, color: "border-2 border-emerald-700", textColor: "text-emerald-700" }
                ].map((cat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4"
                  >
                    <div className={`${cat.color} bg-white w-12 h-12 rounded-xl flex items-center justify-center ${cat.textColor}`}>
                      {cat.icon}
                    </div>
                    <h5 className="font-black uppercase text-[10px] tracking-widest text-slate-400">{cat.label}</h5>
                    <p className="text-xs font-bold">45+ Adaptive Modules</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 8. TESTIMONIALS ===== */}
      <section className="py-14 sm:py-20 md:py-28 bg-white">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black text-green-800 uppercase tracking-[0.4em] mb-4">Social Proof</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold">What Archers Say</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-slate-100 shadow-lg relative"
                >
                  <Quote className="text-stone-300 w-8 h-8 mb-4" />
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="font-bold text-sm text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t.college}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                      {t.result}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 9. CTA FINAL ===== */}
      <section className="py-12 sm:py-16 md:py-20 bg-green-50/30">
        <RevealSection>
          <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/ChatGPT Image Feb 10, 2026, 10_16_51 PM.png"
                alt="Your journey from student to professional"
                width={600}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900">Your Degree Shows You Studied. <br /> iKlavya Proves You Are Ready.</h3>
            <p className="text-slate-500 text-lg font-light">From educated graduate to verified candidate to confident professional to real hiring opportunities. Built in India. Built for Indian youth. Built for Indian employers.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register">
                <button className="border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 w-full sm:w-auto text-center font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                  Create Free Account
                </button>
              </Link>
              <Link href="/login" className="text-slate-700 font-black uppercase text-xs tracking-[0.2em] underline decoration-green-700 decoration-4 underline-offset-8 hover:text-green-800">
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 9.5 INDIA MAP — BUILT FOR BHARAT ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28 overflow-hidden">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
              Built for Bharat
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-4 leading-tight">
              We Understand the Pressure. <br className="hidden sm:block" />
              From <span className="text-green-800 italic">Campus Placements</span> to Career Success.
            </h2>

            {/* India Map */}
            <div className="relative mx-auto mt-12 sm:mt-16 md:mt-20 max-w-md sm:max-w-lg">
              {/* Subtle glow behind map */}
              <div className="absolute inset-0 bg-green-200/20 blur-3xl rounded-full scale-75" />

              <svg
                viewBox="0 0 667 778"
                className="w-full h-auto relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* India outline — Wikimedia Commons CC-BY-SA */}
                <path
                  d="m 215.2163,738.62564 -4,-2.84704 -5.08396,-4.77739 -5.08397,-4.77738 -2.58571,-4.16224 -2.58571,-4.16225 -2.73664,-11.17108 -2.73662,-11.1711 -4.80426,-12.66666 -4.80425,-12.66667 -3.9362,-8 -3.9362,-8 -5.01572,-6.66667 -5.01572,-6.66666 -4.17085,-10.95699 -4.17086,-10.95699 v -3.31493 -3.31493 l -3.95422,-12.19948 -3.95423,-12.19949 -6.04578,-10.31244 -6.04577,-10.31246 v -0.87925 -0.87925 l -3.817,-8.3369 -3.81701,-8.33689 -1.48505,-4 -1.48505,-4 -1.42982,-12 -1.42982,-12 -4.14814,-15.92888 -4.14815,-15.92888 1.54669,-0.51557 1.54668,-0.51556 v -3.36487 -3.36488 l -1.81762,0.6975 -1.81763,0.69748 -0.85927,-10.30346 -0.85928,-10.30345 2.77715,-8.4596 2.77715,-8.45961 -2.95944,-9.20386 -2.95943,-9.20386 2.85918,-3.86726 2.85919,-3.86725 v -0.62793 -0.62792 l -2.82757,-0.42607 -2.82757,-0.42607 -0.53124,-5.97786 -0.53125,-5.97787 -1.83309,-1.83308 -1.83308,-1.83309 -1.47477,6.87658 -1.47476,6.87658 -0.005,2.93437 -0.005,2.93437 -2.693839,4.41843 -2.69383,4.41844 -8.35049,3.90767 -8.350489,3.90766 -7.55505,1.39663 -7.55505,1.39663 -5.28474,-3.33611 -5.28474,-3.33612 -5.1109,-6.26743 -5.1109,-6.26744 -6.29777,-7.09401 -6.29777,-7.09403 -3.58171,-5.41234 -3.58172,-5.41234 1.39566,-1.39566 1.39566,-1.39566 0.89585,1.44951 0.89584,1.44951 5.58798,-0.008 5.58798,-0.008 4.83022,-1.3417 4.83022,-1.34169 6.2277,-5.48184 6.2277,-5.48184 -0.50394,-0.50394 -0.50394,-0.50394 -8.78786,2.16862 -8.78785,2.16862 -4.48755,-0.84186 -4.48755,-0.84187 -7.54448,-4.71911 -7.54448,-4.7191 -2.06743,-4.14426 -2.06753,-4.14313 v -1.6418 -1.6418 l 3.44902,-2.25988 3.44902,-2.25989 -0.72543,-0.72542 -0.72542,-0.72542 -4.79981,2.83196 -4.79981,2.83196 h -0.67902 -0.67901 l 0.42189,-3.66667 0.4219,-3.66667 4.97993,-0.41262 4.97994,-0.41263 1.96682,-2.80804 1.96683,-2.80804 5.71991,0.17657 5.71991,0.17656 7.64598,0.83928 7.64599,0.83928 6.69897,-1.71689 6.69897,-1.71689 1.58837,1.58838 1.58838,1.58838 h 3.15432 3.15433 l 2.49487,-1.33522 2.49488,-1.33522 -0.75993,-4.99811 -0.75994,-4.99812 -3.15593,-9.83685 -3.15593,-9.83687 v -1.8406 -1.8406 l -5.34549,-2.13884 -5.34548,-2.13884 -0.80513,-3.20788 -0.80512,-3.20787 0.91322,-7.30916 0.91322,-7.30916 h -2.82883 -2.82882 l -3.91447,-2.02425 -3.91447,-2.02425 -0.80629,-3.2125 -0.80628,-3.2125 1.1203,-1.95513 1.12031,-1.95512 9.50149,-10.14146 9.5015,-10.14145 h 2.74199 2.74198 l 0.80815,2.54625 0.80816,2.54627 1.67494,1.39008 1.67494,1.39008 9.94009,-1.78487 9.940089,-1.78486 2,-0.90115 1.999999,-0.90113 5.33334,-6.7847 5.33333,-6.78468 3.72072,-3.46565 3.72071,-3.46564 5.93016,-5.83483 5.93016,-5.83481 3.55728,-7.27084 3.55729,-7.27083 3.45851,-2.1405 3.45851,-2.14051 3,-2.65292 3,-2.65293 v -1.91003 -1.91004 l 5.45108,-6.85755 5.45108,-6.85754 1.66944,-0.94715 1.66942,-0.94716 -0.31645,-9.05284 -0.31645,-9.05285 2.02382,-2.28313 2.02384,-2.28315 4.83878,-1.55729 4.83877,-1.5573 1.66667,-1.32282 1.66666,-1.32283 v -1.85407 -1.85406 l -5.76484,-2.80079 -5.76485,-2.80077 -1.45267,-3.84856 -1.45253,-3.84856 h -2.59459 -2.5946 l -7.85456,-3.95934 -7.85456,-3.95934 -1.57907,-17.70733 -1.57908,-17.707325 7.47046,-6.786157 7.47045,-6.786156 -0.89811,-2.340429 -0.8981,-2.34043 -2.58502,-0.675996 -2.58501,-0.675996 -0.40827,-2.858883 -0.40825,-2.858883 -4.66667,-2.194372 -4.66667,-2.194372 -2.53998,-2.810829 -2.53999,-2.810829 h -3.74643 -3.74644 l -1.45411,-2.717031 -1.45411,-2.717029 0.74048,-2.333039 0.74048,-2.333038 6.72316,-6.616599 6.72317,-6.616597 h 6.94355 6.94356 l -0.45187,-2.594964 -0.45185,-2.594964 1.85544,1.53988 1.85544,1.539881 3.92975,-2.097217 3.92976,-2.097217 9.73397,-0.217171 9.73397,-0.217172 9.06994,8.702805 9.06993,8.702805 4.40104,3.271139 4.40103,3.27114 2.6031,4.411929 2.60311,4.411929 5.85861,1.475219 5.85863,1.475217 v 2.50838 2.50838 h 5.14564 5.14564 l 7.58808,-4.049225 7.58808,-4.049227 6.13351,-0.62063 6.13351,-0.620631 1.70365,-1.413913 1.70367,-1.413914 4.02957,2.083771 4.02956,2.083769 h 1.96391 1.96392 l 4.10229,3.451859 4.10231,3.451857 v 2.339408 2.339408 l -2.56184,7.446105 -2.56183,7.446105 -5.03233,4.746637 -5.03234,4.746639 -1.40582,4.287074 -1.40584,4.287069 -4.66667,0.0623 -4.66667,0.0622 v 4.21767 4.21768 l -1,1.00455 -1,1.00454 v 3.13269 3.13268 l 4.66667,2.22538 4.66667,2.22537 0.0472,2.75305 0.0472,2.75305 1.9055,3.33334 1.90551,3.33333 0.0472,1.70851 0.0472,1.70852 -2.33333,0.822 -2.33334,0.82198 -4.34937,3.21626 -4.34939,3.21625 -2.31728,-4.07167 -2.31729,-4.07165 -1.50341,-0.008 -1.5034,-0.008 -1.7146,2.06597 -1.7146,2.06596 2.99361,7.22264 2.99361,7.22263 0.96058,7.07852 0.96057,7.07852 0.99231,1.60557 0.99229,1.60558 2.63773,-1.63936 2.63774,-1.63936 3.2599,4.15804 3.2599,4.15804 7.57764,3.58784 7.57762,3.58784 2.6316,3.34553 2.6316,3.34553 7.03387,3.11071 7.03388,3.11071 -6.91036,7.13454 -6.91036,7.13455 -3.14015,10.57763 -3.14014,10.57762 3.84796,3.07908 3.84794,3.07909 1.20044,0.007 1.20044,0.007 7.46623,3.5886 7.46623,3.58858 2.99262,2.88888 2.99262,2.88888 5.67405,2.7075 5.67404,2.70749 4.66667,1.63416 4.66667,1.63417 3.70365,0.67096 3.70365,0.67096 1.31255,2.45254 1.31256,2.45252 4.50292,0.84476 4.50292,0.84474 9.8142,-1.55618 9.81421,-1.5562 4.80499,2.03856 4.80499,2.03857 2.21452,3.37977 2.2145,3.37976 5.26072,2.68383 5.26071,2.68381 h 3.88987 3.88985 l 1.52101,1.83271 1.52102,1.83271 6.97557,0.99337 6.97559,0.99336 6.96587,0.25089 6.96585,0.25091 0.92303,0.92303 0.92302,0.92302 8.11112,-0.0204 8.11111,-0.0204 1.61844,-1.02846 1.61844,-1.02846 0.10853,-15.95112 0.10854,-15.95112 0.086,-2.91381 0.086,-2.91381 5.38509,-2.15468 5.38509,-2.15468 1.40227,1.40226 1.40228,1.40228 0.38401,9.5432 0.384,9.54319 2.03242,3.10187 2.03241,3.10185 3.6498,1.00557 3.6498,1.00559 8.66667,-0.20035 8.66666,-0.20033 6,-0.20389 6,-0.2039 15.04815,-2.13725 15.04815,-2.13727 -0.88471,-6.10958 -0.88469,-6.10959 -0.65955,-1.13604 -0.65954,-1.13605 -4.50391,-1.88184 -4.50389,-1.88186 v -2.73862 -2.73863 l 2.82554,0.8968 2.82555,0.89679 3.50779,-1.61398 3.50778,-1.61398 4.54252,-2.18224 4.54254,-2.18226 0.58048,-2.21973 0.58046,-2.21975 5.21034,-4.18713 5.21033,-4.18715 v -1.98454 -1.98455 l 5.89897,-2.5286 5.89896,-2.52858 7.78179,-8.17726 7.78177,-8.17725 3.98592,2.07835 3.98592,2.07834 4.25224,0.008 4.25224,0.008 6.0931,-5.27353 6.09309,-5.27353 3.07748,2.9402 3.0775,2.9402 -1.0895,1.26666 -1.08948,1.26667 v 2.56325 2.56327 l 2.14428,-1.7796 2.1443,-1.7796 1.8557,2.53785 1.85572,2.53784 -0.0472,1.41183 -0.0472,1.41183 -1.9055,3.33333 -1.90551,3.33333 -0.0472,1.05771 -0.0472,1.05771 4.33333,-0.2973 4.33334,-0.2973 4.96926,0.23958 4.96926,0.2396 2.23409,3.40966 2.23409,3.40965 -2.88893,3.59034 -2.88893,3.59035 -1.49258,2.92128 -1.49257,2.92127 2.79985,4.7454 2.79986,4.74538 h -1.03354 -1.03352 l -2.58817,-1.9576 -2.58817,-1.95758 -2.79936,-0.0424 -2.79936,-0.0424 -5.38843,3.66666 -5.38843,3.66667 -8.81221,8.28771 -8.81222,8.28769 v 11.11993 11.11992 l -3.43397,4.59238 -3.43397,4.59237 0.71976,5.33333 0.71976,5.33334 -4.21271,12 -4.21271,12 -1.25398,0.85716 -1.25398,0.85715 -7.77806,-0.70529 -7.77807,-0.70529 1.29229,4.506 1.29231,4.506 v 8.19948 8.19948 l -2,0.76748 -2,0.76746 v 13.12035 13.12033 l -1.66667,2.13243 -1.66666,2.13241 -2.92642,-1.14072 -2.92641,-1.14073 -0.87372,-5.07019 -0.87371,-5.07018 -3.11882,-12 -3.11883,-12 -1.75353,-5.33334 -1.75352,-5.33333 h -1.97623 -1.97621 l -1.8764,3.91499 -1.87642,3.91498 -0.65174,5.7823 -0.65175,5.78229 -1.35809,0.83935 -1.35811,0.83936 -2.58125,-3.54351 -2.58127,-3.54349 -1.04625,0.64662 -1.04626,0.64662 -2.29006,-5.99647 -2.29008,-5.99647 1.78588,-5.56113 1.78586,-5.56113 3.87506,-1.02258 3.87505,-1.02257 4.39667,-4.26142 4.39668,-4.26142 0.97984,-4.13149 0.97984,-4.13149 -0.31002,-1.66667 -0.31001,-1.66667 h 1.55504 1.55504 l -1.65985,-2 -1.65986,-2 -22.83673,-0.13293 -22.83675,-0.13293 -3.33333,-0.92696 -3.33334,-0.92698 -0.96818,-7.94012 -0.96818,-7.94013 -1.51006,-3.33333 -1.51006,-3.33334 -1.99806,2.9704 -1.99807,2.97039 -2.85703,-1.47487 -2.85702,-1.47486 -3.08122,-3.49554 -3.08121,-3.49552 -0.69656,1.66667 -0.69657,1.66667 -2.22222,-0.0424 -2.22222,-0.0424 -2.58818,-1.95759 -2.58817,-1.9576 h -1.15719 -1.15717 l 0.76739,1.24165 0.76738,1.24167 -3.35537,4.9444 -3.35536,4.9444 v 1.26105 1.26106 l 4.33333,3.81332 4.33334,3.8133 4.56388,3.07291 4.56386,3.07291 0.54724,1.66666 0.54724,1.66667 h -2.80757 -2.80757 l -5.9702,5.50315 -5.97022,5.50314 v 2.429 2.429 l 4.45919,3.40119 4.45919,3.40118 h 2.18208 2.18208 l 0.80509,3.20775 0.80509,3.20775 -2.24342,3.42389 -2.24342,3.42389 2.79706,4.52574 2.79706,4.52574 v 2.30078 2.30078 l 2.56204,0.66999 2.56206,0.66999 -0.61258,4.20518 -0.61256,4.20519 2.58803,10.56085 2.58804,10.56087 -0.68017,1.77247 -0.68016,1.77248 h -3.23759 -3.2376 l -3.35488,2.1982 -3.35488,2.19821 -1.13545,-1.19821 -1.13546,-1.1982 -0.46276,-2.56956 -0.46274,-2.56956 -3.48502,5.23622 -3.48501,5.23623 -6.83025,2.38175 -6.83026,2.38174 -3.61598,3.11035 -3.61599,3.11033 1.49424,6.50792 1.49424,6.50791 -1.89632,2.10499 -1.89632,2.10498 v 2.18391 2.18389 l -4.56725,4.56726 -4.56726,4.56725 -7.35017,3.4772 -7.35019,3.47718 h -1.97145 -1.97146 l -0.52441,-1.57321 -0.5244,-1.57321 -2.26491,0.86912 -2.2649,0.86913 -1.63688,3.70409 -1.63688,3.70408 -9.53804,12.66667 -9.53804,12.66667 -7.60648,6.51918 -7.60648,6.51918 -3.89774,5.38068 -3.89774,5.38068 -6.30932,3.63956 -6.30934,3.63956 -3,2.84585 -3,2.84585 v 5.219 5.219 l -6.33333,2.95159 -6.33334,2.95157 -5.25897,0.1108 -5.25899,0.1108 -4.07434,5.47402 -4.07436,5.47401 -1.70722,2.52599 -1.70721,2.52598 -0.73723,-1.66666 -0.73724,-1.66667 h -3.59221 -3.59221 l -2.98119,2.08811 -2.9812,2.0881 -2.69829,5.28912 -2.69831,5.28911 0.63792,13.66356 0.63793,13.66356 1.41156,3.71268 1.41156,3.71269 v 1.24653 1.24654 h -2 -2 v 1.28642 1.28642 l 2.83419,1.51681 2.8342,1.51681 -0.86745,7.3807 -0.86747,7.38068 -1.74589,3.48274 -1.7459,3.48275 -3.76314,7.23493 -3.76316,7.23495 0.23496,16.76505 0.23496,16.76507 0.71644,2.28892 0.71644,2.28892 -3.07576,0.6788 -3.07575,0.67881 -3.91979,0.3656 -3.91977,0.36561 -3.0138,5.33334 -3.01379,5.33333 -2.34532,4.40032 -2.34532,4.40032 1.50588,2.41131 1.5059,2.4113 -6.91764,1.5481 -6.91763,1.54809 -4.21623,2.56405 -4.21624,2.56404 -0.86989,5.80086 -0.86988,5.80085 -6.41975,3.60871 -6.41975,3.60872 -3.80349,-0.0423 -3.80349,-0.0423 -4,-2.84704 z"
                  stroke="#166534"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="#166534"
                  fillOpacity="0.05"
                  className="opacity-90"
                />

                {/* Pulsing city dots */}
                {[
                  { cx: 213, cy: 219, label: 'Delhi NCR', r: 5 },
                  { cx: 219, cy: 222, label: 'Greater Noida', r: 7 },
                  { cx: 183, cy: 261, label: 'Jaipur', r: 5 },
                  { cx: 291, cy: 263, label: 'Lucknow', r: 5 },
                  { cx: 379, cy: 294, label: 'Patna', r: 5 },
                  { cx: 217, cy: 354, label: 'Bhopal', r: 5 },
                  { cx: 130, cy: 460, label: 'Mumbai', r: 5 },
                  { cx: 221, cy: 615, label: 'Bengaluru', r: 5 },
                ].map((city, i) => (
                  <g key={city.label}>
                    {/* Static dot */}
                    <circle cx={city.cx} cy={city.cy} r={city.r} fill="#166534" className="opacity-90" />
                    {/* Pulsing ring */}
                    <motion.circle
                      cx={city.cx}
                      cy={city.cy}
                      r={city.r}
                      fill="none"
                      stroke="#166534"
                      strokeWidth="1.5"
                      animate={{
                        r: [city.r, city.r * 3, city.r * 3],
                        opacity: [0.6, 0, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeOut',
                      }}
                    />
                    {/* City label */}
                    <text
                      x={city.cx + city.r + 8}
                      y={city.cy + 4}
                      className="text-[10px] fill-slate-500 font-medium"
                      style={{ fontSize: '10px' }}
                    >
                      {city.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <p className="text-lg sm:text-xl text-slate-600 font-light mt-10 sm:mt-14 max-w-2xl mx-auto leading-relaxed">
              We understand campus placement pressure, Tier 2 and Tier 3 challenges, communication gaps, skill mismatch, and competitive realities. iKlavya brings <span className="text-green-800 font-bold">structured employability engineering</span> to every corner of India &mdash; affordable, multilingual, and AI-powered.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ===== 10. FOOTER ===== */}
      <footer className="bg-slate-100 py-12 sm:py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-20">
            <div className="col-span-2 space-y-6">
              <Link href="/" className="inline-block">
                <Image
                  src="/iklavya logo.png"
                  alt="iKlavya"
                  width={360}
                  height={180}
                  className="h-36 sm:h-44 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-500 max-w-sm font-light">India&apos;s own AI career system. We take you from being an educated person to becoming a job-ready, employable professional.</p>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-green-800">Platform</h5>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/ai-interview" className="hover:text-slate-900 transition-colors">AI Interview</Link></li>
                <li><Link href="/ai-courses" className="hover:text-slate-900 transition-colors">Video Courses</Link></li>
                <li><Link href="/resume-builder" className="hover:text-slate-900 transition-colors">Resume Builder</Link></li>
                <li><Link href="/skill-assessment" className="hover:text-slate-900 transition-colors">Skill Assessment</Link></li>
                <li><Link href="/live-quiz" className="hover:text-slate-900 transition-colors">Live Quiz</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Resources</h5>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/career-guidance" className="hover:text-slate-900 transition-colors">Career Guidance</Link></li>
                <li><Link href="/certifications" className="hover:text-slate-900 transition-colors">Certifications</Link></li>
                <li><Link href="/support" className="hover:text-slate-900 transition-colors">Mentorship</Link></li>
                <li><Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-slate-900 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500">Company</h5>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                <li><Link href="/team" className="hover:text-slate-900 transition-colors">Team</Link></li>
                <li><Link href="/careers" className="hover:text-slate-900 transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            &copy; {new Date().getFullYear()} IKLAVYA TECHNOLOGIES. BUILT FOR BHARAT.
          </div>
        </div>
      </footer>
    </div>
  )
}
