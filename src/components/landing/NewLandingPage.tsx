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
      title: "Ultra-Low Latency Interview Engine",
      tag: "Real-time AI",
      desc: "Experience 0.2s latency feedback. Our engine analyzes tone, confidence, body language, and communication clarity as you speak.",
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
      title: "AI Resume Pulse-Checker",
      tag: "ATS Domination",
      desc: "Watch our AI rewrite your bullet points in real-time to match the top 1% of industry standards.",
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
      desc: "Our AI assesses your personality, communication style, and workplace readiness to build a step-by-step growth path toward your dream role.",
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
                Empowering India&apos;s <br /> <span className="text-green-800 italic">Education</span> &amp; Skilling <br /> Ecosystem with <span className="text-green-800 italic">AI</span>.
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-xl leading-relaxed">
                Degree? Common. Skill? Rare. Presence? <span className="text-green-800 font-bold italic">iKlavya.</span>{' '}
                Our real-time AI engine turns your potential into professional dominance.
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
              <h2 className="text-sm font-black text-green-800 uppercase tracking-[0.4em] mb-4">The Real Features</h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold">Built for Zero Latency.</h3>
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
                { step: 1, icon: <Mic className="w-6 h-6" />, title: "Take AI Interview", desc: "Our engine simulates real interviews with live feedback on tone, accuracy, and confidence.", color: "border-2 border-green-800", textColor: "text-green-800", delay: 0 },
                { step: 2, icon: <BarChart3 className="w-6 h-6" />, title: "Get Skill Analysis", desc: "Receive a detailed breakdown of your strengths, gaps, and where you rank against peers.", color: "border-2 border-amber-700", textColor: "text-amber-700", delay: 0.15 },
                { step: 3, icon: <Target className="w-6 h-6" />, title: "Follow Your Roadmap", desc: "A personalized learning path adapts in real-time based on your performance.", color: "border-2 border-emerald-700", textColor: "text-emerald-700", delay: 0.3 }
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
                  Don&apos;t just claim skills. Win them. Compete in live quiz broadcasts, real-time negotiation face-offs, and communication challenges. Top performers get direct job assistance and &quot;Direct-to-Interview&quot; passes from our corporate partners.
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
                    <p className="text-xs text-slate-500">Curated hiring pipelines for high-ranking archers.</p>
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
              { target: 15, suffix: '+', label: 'Corporate Partners', color: 'text-emerald-600' },
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
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight">Courses That <br /> Adapt to You.</h3>
                <p className="text-lg text-slate-600 font-light">
                  Traditional courses are static. Ours are dynamic. Every lesson, quiz, and project shifts based on your performance in the AI Interviews. If you struggle with confidence, we inject communication modules. If you lack workplace skills, we suggest leadership and negotiation labs.
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
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900">Your Career is Not a <br /> Coincidence.</h3>
            <p className="text-slate-500 text-lg font-light">Join the elite rank of students mastering their professional future with Iklavya AI.</p>
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
              From Every Corner of India. <br className="hidden sm:block" />
              For <span className="text-green-800 italic">Every Dream</span> That Deserves a Chance.
            </h2>

            {/* India Map */}
            <div className="relative mx-auto mt-12 sm:mt-16 md:mt-20 max-w-md sm:max-w-lg">
              {/* Subtle glow behind map */}
              <div className="absolute inset-0 bg-green-200/20 blur-3xl rounded-full scale-75" />

              <svg
                viewBox="0 0 600 700"
                className="w-full h-auto relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* India outline path — simplified */}
                <path
                  d="M265 30 L280 28 L295 32 L310 25 L320 30 L335 28 L345 35 L355 32 L365 38
                     L375 35 L390 42 L400 38 L405 45 L415 50 L425 48 L430 55 L440 60 L445 65
                     L450 72 L455 78 L458 85 L462 95 L465 105 L470 115 L475 125 L478 135
                     L482 145 L485 155 L488 165 L490 175 L492 185 L490 195 L488 205
                     L485 215 L480 225 L475 235 L470 240 L465 248 L460 255 L455 265
                     L450 275 L445 285 L440 295 L435 305 L430 315 L425 325 L420 335
                     L415 340 L410 348 L405 355 L398 362 L390 370 L382 378 L375 385
                     L368 392 L360 400 L352 408 L345 415 L338 422 L330 430 L322 438
                     L315 445 L308 452 L300 460 L295 468 L290 475 L285 485 L280 495
                     L278 505 L276 515 L275 525 L274 535 L275 545 L278 555 L282 565
                     L288 572 L295 580 L302 588 L310 595 L318 600 L325 608 L330 615
                     L328 620 L322 625 L315 628 L308 625 L300 620 L292 615 L285 610
                     L278 605 L270 598 L262 590 L255 582 L248 575 L242 568 L235 560
                     L228 550 L222 540 L218 530 L215 520 L212 510 L210 500 L208 490
                     L205 480 L200 470 L195 462 L190 455 L185 448 L178 440 L170 432
                     L162 425 L155 420 L148 415 L140 408 L132 400 L125 392 L120 385
                     L115 378 L110 370 L108 362 L106 355 L105 348 L108 340 L112 332
                     L118 325 L125 318 L130 310 L132 302 L128 295 L122 288 L115 282
                     L108 275 L102 268 L98 260 L95 252 L92 245 L90 238 L88 230
                     L87 222 L88 215 L90 208 L93 200 L98 192 L105 185 L112 178
                     L118 170 L122 162 L125 155 L128 148 L130 140 L132 132 L135 125
                     L140 118 L145 112 L152 105 L158 98 L165 92 L172 88 L180 85
                     L188 82 L195 80 L202 78 L210 75 L218 72 L225 68 L232 62
                     L240 55 L248 48 L255 40 L260 35 Z"
                  stroke="#166534"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="opacity-80"
                />

                {/* Kashmir region detail */}
                <path
                  d="M215 72 L205 60 L200 50 L198 42 L202 35 L210 30 L220 28 L230 25
                     L240 22 L250 20 L258 22 L265 28 L265 30"
                  stroke="#166534"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="opacity-80"
                />

                {/* Sri Lanka outline (small) */}
                <path
                  d="M318 630 L325 635 L330 645 L328 655 L322 660 L315 655 L312 645 L315 635 Z"
                  stroke="#166534"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="opacity-40"
                />

                {/* Pulsing city dots */}
                {[
                  { cx: 268, cy: 162, label: 'Delhi NCR', r: 5 },
                  { cx: 278, cy: 180, label: 'Greater Noida', r: 7 },
                  { cx: 250, cy: 188, label: 'Jaipur', r: 4.5 },
                  { cx: 308, cy: 200, label: 'Lucknow', r: 4.5 },
                  { cx: 385, cy: 228, label: 'Patna', r: 4.5 },
                  { cx: 260, cy: 290, label: 'Bhopal', r: 4.5 },
                  { cx: 150, cy: 380, label: 'Mumbai', r: 5 },
                  { cx: 280, cy: 500, label: 'Bengaluru', r: 5 },
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
              Reaching <span className="text-green-800 font-bold">1 million learners</span> across
              Tier 2 and Tier 3 India with affordable, multilingual,
              AI-powered education and career intelligence.
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
                  width={280}
                  height={140}
                  className="h-28 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-500 max-w-sm font-light">The AI-Mastery platform for the next generation of global professionals. Building high-integrity careers through assessment and simulation.</p>
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
            &copy; {new Date().getFullYear()} IKLAVYA TECHNOLOGIES. ALL ARCHERS WELCOME.
          </div>
        </div>
      </footer>
    </div>
  )
}
