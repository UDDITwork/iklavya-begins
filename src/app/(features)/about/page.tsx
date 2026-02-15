'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Target, Zap, Trophy, Users,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

// --- Scroll reveal wrapper (same as landing page) ---
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

// --- Animated counter for stats (same as landing page) ---
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

// --- Feature data for the showcase section ---
const topFeatures = [
  {
    tag: 'AI Interview Simulation',
    tagColor: 'text-green-800',
    title: 'Practice Under Pressure. Perform Under Spotlight.',
    description: 'Our AI interviewer conducts real-time voice analysis with 0.2-second latency feedback. It tracks confidence scoring, detects filler words, evaluates tone and assertiveness, and runs five distinct scenario types -- from sales pitches to conflict resolution.',
    bullets: ['Real-time voice & tone analysis', 'Filler word detection', 'Confidence scoring', '5 scenario types'],
    image: '/about graphics/ai interviewers.png',
    imageBg: 'bg-green-50/60',
    glowColor: 'bg-green-400/10',
    link: '/ai-interview',
    linkLabel: 'Try AI Interview',
  },
  {
    tag: 'AI Video Courses',
    tagColor: 'text-amber-800',
    title: 'Courses That Shift Based on Your Weaknesses.',
    description: 'Static courses waste time. Our AI-powered video curriculum adapts in real-time based on your interview performance. Struggle with confidence? Communication modules inject automatically. Weak in negotiation? Leadership labs appear in your queue.',
    bullets: ['Communication Mastery', 'Public Speaking', 'Sales & Persuasion', 'Leadership Skills'],
    image: '/about graphics/bfc814d1-afe3-4552-9414-d77306eabc52.png',
    imageBg: 'bg-amber-50/60',
    glowColor: 'bg-amber-400/10',
    link: '/ai-courses',
    linkLabel: 'Browse Courses',
  },
  {
    tag: 'Resume Builder',
    tagColor: 'text-emerald-600',
    title: 'Your Resume, Rewritten by AI for the Top 1%.',
    description: 'Watch our AI rewrite your bullet points in real-time to match industry-leading standards. Every resume is ATS-optimized, keyword-targeted, and formatted to pass automated screening systems that reject 75% of applicants.',
    bullets: ['AI rewriting engine', 'ATS optimization', 'Keyword targeting', 'Industry-standard formatting'],
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_33_19 PM.png',
    imageBg: 'bg-emerald-50/60',
    glowColor: 'bg-emerald-400/10',
    link: '/resume-builder',
    linkLabel: 'Build Your Resume',
  },
]

const gridFeatures = [
  {
    tag: 'Skill Assessment',
    tagColor: 'text-orange-500',
    title: 'Know Exactly Where You Stand.',
    shortDescription: 'Track your soft skills through visual radar charts and performance reports. See how you rank against peers nationwide and turn weaknesses into measurable growth.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_03 PM.png',
    imageBg: 'bg-orange-50/60',
    link: '/skill-assessment',
  },
  {
    tag: 'Live Quiz Arena',
    tagColor: 'text-orange-600',
    title: 'Prove Your Worth on the National Stage.',
    shortDescription: 'Compete in real-time quiz competitions with thousands of students. Climb leaderboards, maintain streaks, and earn corporate partner passes.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_36_04 PM.png',
    imageBg: 'bg-stone-100/60',
    link: '/live-quiz',
  },
  {
    tag: 'Career Guidance',
    tagColor: 'text-green-800',
    title: 'A Personal AI Coach That Knows Your Path.',
    shortDescription: 'Our AI Career Coach analyzes your personality and assessment scores to build step-by-step growth roadmaps toward your target role.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_58 PM.png',
    imageBg: 'bg-green-50/40',
    link: '/career-guidance',
  },
  {
    tag: 'Certifications',
    tagColor: 'text-amber-800',
    title: 'Credentials That Recruiters Verify.',
    shortDescription: 'Earn verifiable digital certificates with QR codes and micro-badges. Share directly to LinkedIn with tamper-proof verification.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_42_56 PM.png',
    imageBg: 'bg-amber-50/40',
    link: '/certifications',
  },
  {
    tag: 'Support & Mentorship',
    tagColor: 'text-emerald-600',
    title: 'Expert Humans Behind the AI Engine.',
    shortDescription: 'Behind every AI recommendation stands a team of expert coaches available for live sessions, resume reviews, and career guidance.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 07_00_30 PM.png',
    imageBg: 'bg-stone-50/60',
    link: '/support',
  },
]

const stats = [
  { target: 520, suffix: '+', label: 'Students Trained', color: 'text-green-800' },
  { target: 8, suffix: '', label: 'Core Skill Pillars', color: 'text-emerald-600' },
  { target: 3200, suffix: '+', label: 'AI Interviews Completed', color: 'text-orange-500' },
  { target: 45, suffix: '%', label: 'Avg. ATS Score Boost', color: 'text-amber-800' },
]

const differentiators = [
  {
    icon: Zap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'AI-First Architecture',
    description: 'Every feature is powered by purpose-built AI models. From 0.2-second interview feedback to adaptive course pathways, intelligence is the foundation.',
  },
  {
    icon: Target,
    iconColor: 'text-green-800',
    iconBg: 'bg-green-50/40',
    title: 'Personalized to the Individual',
    description: 'No two students follow the same path. Our engine builds custom learning trajectories based on personality profiles, performance data, and career targets.',
  },
  {
    icon: Trophy,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Competition-Driven Growth',
    description: 'Passive learning fails. Live quiz arenas, peer leaderboards, and national rankings inject urgency and accountability into every student journey.',
  },
  {
    icon: Users,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Human + AI Mentorship',
    description: 'AI handles scale. Humans handle nuance. Every student has access to expert career coaches for the moments that demand genuine human insight.',
  },
]

const journeySteps = [
  { step: 1, title: 'Assess', desc: 'Take AI interviews and skill assessments', borderColor: 'border-green-800', textColor: 'text-green-800' },
  { step: 2, title: 'Identify', desc: 'Discover strengths, gaps, and career direction', borderColor: 'border-amber-700', textColor: 'text-amber-700' },
  { step: 3, title: 'Learn', desc: 'Follow your adaptive course pathway', borderColor: 'border-emerald-700', textColor: 'text-emerald-700' },
  { step: 4, title: 'Compete', desc: 'Prove skills in live arena competitions', borderColor: 'border-orange-600', textColor: 'text-orange-600' },
  { step: 5, title: 'Certify', desc: 'Earn verifiable credentials and launch', borderColor: 'border-green-800', textColor: 'text-green-800' },
]

const problems = [
  {
    number: '01',
    problem: 'Students graduate without workplace skills',
    solution: 'iKlavya simulates real workplace scenarios with AI-powered interview practice, negotiation drills, and team communication exercises.',
  },
  {
    number: '02',
    problem: 'Resumes fail automated screening',
    solution: 'Our AI Resume Builder rewrites bullet points to match the top 1% of industry standards, boosting ATS scores by up to 45%.',
  },
  {
    number: '03',
    problem: 'No personalized career direction',
    solution: 'Our AI Career Coach builds step-by-step growth roadmaps based on personality assessment, communication style, and skill gaps.',
  },
]

export default function AboutPage() {
  return (
    <div className="selection:bg-green-100">
      {/* ===== SECTION 1: Hero ===== */}
      <section className="bg-[#FDFCF6] pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="max-w-4xl">
              <div className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-8">
                <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                  About iKlavya
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
                The Career Readiness
                <br />
                Platform That{' '}
                <span className="text-green-800 italic">Refuses</span>
                <br />
                to Be Ordinary.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-xl leading-relaxed mb-10">
                iKlavya is an AI-powered student career readiness platform that transforms raw
                potential into professional dominance. We do not teach theory. We simulate reality --
                real interviews, real competition, real results.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="#features">
                  <button className="border-2 border-green-800 text-green-800 bg-white hover:bg-green-50/50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-green-200/30">
                    Explore Features
                  </button>
                </Link>
                <Link href="#platform">
                  <button className="border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                    Meet the Platform
                  </button>
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== SECTION 2: Mission Statement ===== */}
      <section className="bg-white border-y border-slate-100 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              Our Mission
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug mt-6">
              Every student deserves a real shot at their dream career --
              not just a degree, but the confidence, communication, and
              readiness to win it.
            </h2>

            <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mt-6">
              Traditional education prepares students for exams. iKlavya prepares them for the
              room -- the interview room, the boardroom, the conference room. We bridge the gap
              between academic achievement and workplace dominance through AI-driven simulation
              and personalized skill development.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ===== SECTION 3: The Gap ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">
                The Gap
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Degrees Are Common. Readiness Is Rare.
              </h2>
            </div>
          </RevealSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-stone-300 via-amber-300 to-emerald-300" />

            <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
              {problems.map((item, i) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="text-center space-y-4 relative"
                >
                  <span className="text-6xl font-bold text-stone-200">{item.number}</span>
                  <h3 className="text-lg font-bold text-slate-900">{item.problem}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.solution}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: Feature Showcase ===== */}
      <section id="features" className="bg-white py-16 sm:py-20 md:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-16 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                What We Offer
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-4">
                Eight Pillars of Career Dominance.
              </h2>
            </div>
          </RevealSection>

          {/* Top 3 features: Full alternating rows */}
          <div className="space-y-20 sm:space-y-28 md:space-y-32 mb-20 sm:mb-28">
            {topFeatures.map((feature, i) => {
              const isOdd = i % 2 === 0
              return (
                <div key={feature.tag} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
                  {/* Image column */}
                  <motion.div
                    initial={{ opacity: 0, x: isOdd ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`relative ${!isOdd ? 'lg:order-2' : ''}`}
                  >
                    <div className={`relative rounded-2xl overflow-hidden ${feature.imageBg} p-6 sm:p-8 md:p-10`}>
                      <div className={`absolute -inset-10 ${feature.glowColor} rounded-full blur-3xl`} />
                      <Image
                        src={feature.image}
                        alt={feature.tag}
                        width={480}
                        height={480}
                        className="relative z-10 w-full h-auto max-h-[400px] object-contain"
                        priority={i === 0}
                      />
                    </div>
                  </motion.div>

                  {/* Text column */}
                  <motion.div
                    initial={{ opacity: 0, x: isOdd ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className={`space-y-6 ${!isOdd ? 'lg:order-1' : ''}`}
                  >
                    <span className={`text-[10px] font-black ${feature.tagColor} uppercase tracking-widest`}>
                      {feature.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-slate-600 font-light leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-3">
                      {feature.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-3">
                          <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-bold text-slate-700">{bullet}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={feature.link} className="inline-flex items-center gap-2 text-green-800 font-black uppercase text-xs tracking-widest group mt-2">
                      {feature.linkLabel}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* Bottom 5 features: Compact card grid */}
          <div className="space-y-6">
            {/* Row 1: 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gridFeatures.slice(0, 2).map((feature, i) => (
                <motion.div
                  key={feature.tag}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden group cursor-pointer transition-shadow hover:shadow-xl"
                >
                  <div className={`h-48 sm:h-56 ${feature.imageBg} flex items-center justify-center p-6 overflow-hidden`}>
                    <Image
                      src={feature.image}
                      alt={feature.tag}
                      width={280}
                      height={280}
                      className="w-auto h-full max-h-[200px] object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <span className={`text-[9px] font-black ${feature.tagColor} uppercase tracking-widest`}>
                      {feature.tag}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.shortDescription}</p>
                    <Link href={feature.link} className="inline-flex items-center gap-2 text-green-800 font-black uppercase text-xs tracking-widest group/link mt-2">
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Row 2: 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gridFeatures.slice(2).map((feature, i) => (
                <motion.div
                  key={feature.tag}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden group cursor-pointer transition-shadow hover:shadow-xl"
                >
                  <div className={`h-48 sm:h-56 ${feature.imageBg} flex items-center justify-center p-6 overflow-hidden`}>
                    <Image
                      src={feature.image}
                      alt={feature.tag}
                      width={280}
                      height={280}
                      className="w-auto h-full max-h-[200px] object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <span className={`text-[9px] font-black ${feature.tagColor} uppercase tracking-widest`}>
                      {feature.tag}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.shortDescription}</p>
                    <Link href={feature.link} className="inline-flex items-center gap-2 text-green-800 font-black uppercase text-xs tracking-widest group/link mt-2">
                      Learn More
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: Stats Counter Strip ===== */}
      <section className="bg-white border-y border-slate-100 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className={`text-4xl sm:text-5xl font-bold ${stat.color}`}>
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ===== SECTION 6: Why iKlavya ===== */}
      <section id="platform" className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-amber-800 uppercase tracking-[0.4em]">
                Why iKlavya
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Built Different. Built for Results.
              </h2>
            </div>
          </RevealSection>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {differentiators.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col space-y-5 transition-shadow hover:shadow-2xl"
              >
                <div className={`${item.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <item.icon className={`${item.iconColor} w-6 h-6`} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SECTION 7: Journey Flow ===== */}
      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em]">
                Your Journey
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                From Student to Professional in Five Steps.
              </h2>
            </div>
          </RevealSection>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-green-300 via-amber-300 via-50% via-emerald-300 via-75% to-green-300" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-6">
              {journeySteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`${item.borderColor} bg-white w-14 h-14 rounded-2xl flex items-center justify-center ${item.textColor} shadow-lg relative z-10 border-2`}>
                      <span className="text-lg font-bold">{item.step}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Step {item.step}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500 max-w-[150px] mx-auto leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: Belief Statement ===== */}
      <section className="bg-[#FDFCF6] py-14 sm:py-20 md:py-28">
        <RevealSection>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
              Our Belief
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug italic mt-8">
              &ldquo;We believe that career success is not a lottery.
              It is an engineered outcome -- built through
              deliberate practice, intelligent feedback,
              and relentless self-improvement.&rdquo;
            </h2>

            <p className="text-sm font-black text-green-800 uppercase tracking-widest mt-8">
              -- The iKlavya Team
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ===== SECTION 9: Final CTA ===== */}
      <section className="bg-green-50/30 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900">
              Your Career Starts Here.
            </h2>

            <p className="text-slate-500 text-lg font-light max-w-xl mx-auto">
              Join the growing community of students transforming their potential into
              professional readiness with iKlavya.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/ai-interview">
                <button className="border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                  Start Your Journey
                </button>
              </Link>
              <Link
                href="/support"
                className="text-slate-700 font-black uppercase text-xs tracking-[0.2em] underline decoration-green-700 decoration-4 underline-offset-8 hover:text-green-800 transition-colors"
              >
                Speak with a Mentor
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  )
}
