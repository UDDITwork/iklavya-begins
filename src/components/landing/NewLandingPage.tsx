'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
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
        className="w-1 bg-blue-500 rounded-full"
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
            <div className="flex gap-4 items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <Mic className="text-white w-5 h-5" />
              </div>
              <Waveform />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-[11px] text-blue-600 font-mono mb-2">AI LIVE ANALYSIS:</p>
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
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Your Roadmap</span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">78% Complete</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
            <motion.div initial={{ width: "0%" }} animate={{ width: "78%" }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-full" />
          </div>
          {/* Milestone steps */}
          <div className="space-y-3">
            {[
              { step: "Communication Basics", status: "done", color: "bg-emerald-500" },
              { step: "Active Listening", status: "done", color: "bg-emerald-500" },
              { step: "Negotiation Tactics", status: "current", color: "bg-blue-500" },
              { step: "Conflict Resolution", status: "upcoming", color: "bg-slate-200" },
              { step: "Team Leadership", status: "upcoming", color: "bg-slate-200" }
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${m.color} ${m.status === 'current' ? 'ring-4 ring-blue-100' : ''} flex-shrink-0`} />
                <div className={`flex-1 text-xs font-bold ${m.status === 'done' ? 'text-slate-400 line-through' : m.status === 'current' ? 'text-blue-700' : 'text-slate-300'}`}>{m.step}</div>
                {m.status === 'done' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                {m.status === 'current' && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">IN PROGRESS</span>}
              </div>
            ))}
          </div>
          {/* Target */}
          <div className="mt-5 p-3 bg-violet-50 rounded-lg border border-violet-100 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-violet-600 uppercase">Target Role</p>
              <p className="text-sm font-bold text-slate-800">Team Leader</p>
            </div>
            <Target className="w-5 h-5 text-violet-500" />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="bg-[#FDFCF6] font-sans text-slate-900 selection:bg-indigo-100">

      {/* Marquee CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ===== 1. HERO ===== */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-[120%] bg-indigo-50/50 -skew-x-12 translate-x-32 -z-10" />
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-10">
              <div className="inline-block px-4 py-2 bg-indigo-100 rounded-full">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Live Competition Starts in 04:12:00
                </p>
              </div>
              <h1 className="text-8xl md:text-9xl font-serif font-bold text-slate-900 leading-[0.85] tracking-tight">
                Master the <br /> <span className="text-blue-600 italic">Unfair</span> Advantage.
              </h1>
              <p className="text-xl text-slate-600 font-light max-w-xl leading-relaxed">
                Degree? Common. <br />Skill? Rare. <br />Presence? <span className="text-blue-600 font-bold italic">Iklavya.</span>{' '}
                Our real-time AI engine turns your potential into professional dominance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/ai-interview">
                  <button className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest rounded-lg flex items-center gap-3 shadow-lg shadow-blue-200">
                    Start Free Mock Interview <Zap className="w-4 h-4 text-amber-300" />
                  </button>
                </Link>
                <Link href="/live-quiz">
                  <button className="px-10 py-5 border-2 border-slate-200 text-slate-700 font-black uppercase text-xs tracking-widest rounded-lg hover:bg-slate-50">
                    Watch Live Competition
                  </button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-10 bg-amber-400/10 rounded-full blur-3xl" />
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 relative z-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-black uppercase text-slate-400">Skill Radar v4</h4>
                  <TrendingUp className="text-indigo-600 w-5 h-5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Vocal Clarity", val: "92%" },
                    { label: "Tech Accuracy", val: "88%" },
                    { label: "Confidence", val: "95%" },
                    { label: "ATS Readiness", val: "91%" }
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-[9px] font-black text-slate-400 uppercase">{s.label}</p>
                      <p className="text-xl font-bold text-slate-900">{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-blue-600">
                    <span>Global Archer Rank</span>
                    <span>#1,242 / 450k</span>
                  </div>
                </div>
              </motion.div>
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
              <div key={i} className="inline-flex items-center mx-8 shrink-0">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mr-3" />
                <span className="text-sm font-bold text-slate-500 tracking-wide">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. CORE ENGINE SHOWDOWN ===== */}
      <section className="py-32 bg-white relative">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">The Real Features</h2>
              <h3 className="text-6xl font-serif font-bold">Built for Zero Latency.</h3>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 space-y-4">
                {Object.entries(productFeatures).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full text-left p-6 rounded-xl transition-all border-2 ${activeTab === key ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-100 translate-x-4' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === key ? 'text-blue-100' : 'text-blue-600'}`}>{value.tag}</span>
                      {activeTab === key && <Zap className="w-4 h-4 text-amber-300" />}
                    </div>
                    <h4 className={`text-lg font-bold mb-2 ${activeTab === key ? 'text-white' : 'text-slate-900'}`}>{value.title}</h4>
                    <p className={`text-xs ${activeTab === key ? 'text-blue-100' : 'text-slate-500'}`}>{value.desc}</p>
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
      <section className="py-28 bg-[#FDFCF6]">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">The Process</h2>
              <h3 className="text-5xl font-serif font-bold">How Iklavya Works</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-indigo-300 via-amber-300 to-emerald-300" />

              {[
                { step: 1, icon: <Mic className="w-6 h-6" />, title: "Take AI Interview", desc: "Our engine simulates real interviews with live feedback on tone, accuracy, and confidence.", color: "bg-indigo-600", delay: 0 },
                { step: 2, icon: <BarChart3 className="w-6 h-6" />, title: "Get Skill Analysis", desc: "Receive a detailed breakdown of your strengths, gaps, and where you rank against peers.", color: "bg-amber-500", delay: 0.15 },
                { step: 3, icon: <Target className="w-6 h-6" />, title: "Follow Your Roadmap", desc: "A personalized learning path adapts in real-time based on your performance.", color: "bg-emerald-600", delay: 0.3 }
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
                    <div className={`${s.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10`}>
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
      <section className="py-32 bg-slate-50 overflow-hidden">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
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

                  <div className="mt-10 p-4 bg-blue-600 rounded-lg text-center font-black uppercase text-xs tracking-widest text-white">
                    Next Quiz Starts in 12:45
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h2 className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">Live Competitions</h2>
                <h3 className="text-5xl font-serif font-bold leading-tight text-slate-900">Prove Your Worth <br /> on the National Stage.</h3>
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
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Building2 className="text-blue-500 w-5 h-5" />
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
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 520, suffix: '+', label: 'Students Trained', color: 'text-blue-600' },
              { target: 15, suffix: '+', label: 'Corporate Partners', color: 'text-emerald-600' },
              { target: 3200, suffix: '+', label: 'Interviews Simulated', color: 'text-orange-500' },
              { target: 99.9, suffix: '%', label: 'Platform Uptime', color: 'text-violet-600', isDecimal: true }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
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
      <section className="py-32 bg-[#FDFCF6]">
        <RevealSection>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-10">
                <h2 className="text-sm font-black text-violet-600 uppercase tracking-[0.4em]">Personalized Learning</h2>
                <h3 className="text-5xl font-serif font-bold leading-tight">Courses That <br /> Adapt to You.</h3>
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
                <Link href="/ai-courses" className="text-blue-600 font-black uppercase text-xs tracking-widest flex items-center gap-2 group">
                  Explore Our Module Catalog <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-6">
                {[
                  { label: "Communication", icon: <MessageSquare />, color: "bg-blue-500" },
                  { label: "Negotiation", icon: <Users />, color: "bg-orange-500" },
                  { label: "Leadership", icon: <Award />, color: "bg-indigo-500" },
                  { label: "Time Mgmt", icon: <Clock />, color: "bg-emerald-500" }
                ].map((cat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4"
                  >
                    <div className={`${cat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
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
      <section className="py-28 bg-white">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Social Proof</h2>
              <h3 className="text-5xl font-serif font-bold">What Archers Say</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg relative"
                >
                  <Quote className="text-indigo-200 w-8 h-8 mb-4" />
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
      <section className="py-20 bg-blue-50">
        <RevealSection>
          <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
            <h3 className="text-5xl font-serif font-bold text-slate-900">Your Career is Not a <br /> Coincidence.</h3>
            <p className="text-slate-500 text-lg font-light">Join the elite rank of students mastering their professional future with Iklavya AI.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/ai-interview">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-blue-200">
                  Get Started Now
                </button>
              </Link>
              <Link href="/support" className="text-slate-700 font-black uppercase text-xs tracking-[0.2em] underline decoration-blue-400 decoration-4 underline-offset-8 hover:text-blue-600">
                Speak with a Mentor
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== 10. FOOTER ===== */}
      <footer className="bg-slate-100 py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Target className="text-blue-600 w-8 h-8" />
                <span className="text-3xl font-serif font-black text-slate-900">IKLAVYA</span>
              </div>
              <p className="text-slate-500 max-w-sm font-light">The AI-Mastery platform for the next generation of global professionals. Building high-integrity careers through assessment and simulation.</p>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Platform</h5>
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
