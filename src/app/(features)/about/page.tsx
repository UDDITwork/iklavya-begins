'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Target, Zap, Trophy, Users,
  Phone, Mail, Globe, MapPin,
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
    tag: 'AI-Proctored Smart Classroom',
    tagColor: 'text-green-800',
    title: 'Real-Time Attention Tracking. Outcome-Driven Learning.',
    description: 'Real-time computer vision and behavioral AI track attention, engagement, and participation to ensure high-quality, outcome-driven learning across every classroom session.',
    bullets: ['Real-time voice & tone analysis', 'Filler word detection', 'Confidence scoring', '5 scenario types'],
    image: '/about graphics/ai interviewers.png',
    link: '/ai-interview',
    linkLabel: 'Try AI Interview',
  },
  {
    tag: 'AI Tutor',
    tagColor: 'text-amber-800',
    title: 'An Adaptive Tutor That Learns How You Learn.',
    description: 'An adaptive AI tutor that customizes explanations, pace, and practice based on each learner\'s strengths, gaps, and learning style. No two students get the same path.',
    bullets: ['Personalized explanations', 'Adaptive pacing', 'Strength-based learning', 'Gap identification'],
    image: '/about graphics/bfc814d1-afe3-4552-9414-d77306eabc52.png',
    link: '/ai-courses',
    linkLabel: 'Browse Courses',
  },
  {
    tag: 'AI Assessments',
    tagColor: 'text-emerald-600',
    title: 'Holistic Learner Profiling. Beyond Exams.',
    description: 'Automated textual, audio, and video-based assessments combined with psychometric and course-specific evaluation for holistic learner profiling that goes far beyond traditional testing.',
    bullets: ['Textual assessments', 'Audio & video evaluation', 'Psychometric profiling', 'Course-specific analysis'],
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_33_19 PM.png',
    link: '/skill-assessment',
    linkLabel: 'Assess Your Skills',
  },
]

const gridFeatures = [
  {
    tag: 'AI Job Readiness Suite',
    tagColor: 'text-orange-500',
    title: 'Interview-Ready. Resume-Perfect.',
    shortDescription: 'An integrated toolset including AI Resume Builder, AI Interviews and AI Career Mapping to prepare learners for real-world hiring.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_03 PM.png',
    link: '/ai-interview',
  },
  {
    tag: 'AI Skill-to-Job Matchmaking',
    tagColor: 'text-orange-600',
    title: 'The Right Candidate. The Right Role.',
    shortDescription: 'Intelligent matching of candidates and employers based on verified skills, aptitude, and organizational fit.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_36_04 PM.png',
    link: '/career-guidance',
  },
  {
    tag: 'Career Guidance',
    tagColor: 'text-green-800',
    title: 'A Personal AI Coach That Knows Your Path.',
    shortDescription: 'Our AI Career Coach analyzes your personality and assessment scores to build step-by-step growth roadmaps toward your target role.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_58 PM.png',
    link: '/career-guidance',
  },
  {
    tag: 'Certifications',
    tagColor: 'text-amber-800',
    title: 'Credentials That Recruiters Verify.',
    shortDescription: 'Earn verifiable digital certificates with QR codes and micro-badges. Share directly to LinkedIn with tamper-proof verification.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_42_56 PM.png',
    link: '/certifications',
  },
  {
    tag: 'From Skill to Salary',
    tagColor: 'text-emerald-600',
    title: 'The Outcome That Matters.',
    shortDescription: 'iKlavya doesn\'t just train. We ensure learners become job-ready, employable, and placed at scale.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 07_00_30 PM.png',
    link: '/support',
  },
]

const stats = [
  { target: 1, suffix: 'M+', label: 'Target Learners', color: 'text-green-800' },
  { target: 8, suffix: '', label: 'Core AI Modules', color: 'text-emerald-600' },
  { target: 3200, suffix: '+', label: 'AI Interviews Completed', color: 'text-orange-500' },
  { target: 520, suffix: '+', label: 'Students Trained', color: 'text-amber-800' },
]

const builtForBharat = [
  {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    text: 'Multilingual Interface & Voice Support',
  },
  {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    text: 'Optimized for low-bandwidth environments',
  },
  {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    text: 'Accessible on Mobile-First Infrastructure',
  },
  {
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    text: 'Scalable Across Colleges, ITIs, & Training Centers',
  },
]

const differentiators = [
  {
    icon: Zap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'Learning & Assessment Intelligence',
    description: 'AI-Proctored Smart Classrooms, adaptive AI Tutors, and automated textual, audio, and video-based assessments for holistic learner profiling.',
  },
  {
    icon: Target,
    iconColor: 'text-green-800',
    iconBg: 'bg-green-50/40',
    title: 'Career & Employability Intelligence',
    description: 'AI Job Readiness Suite, AI Skill-to-Job Matchmaking, and end-to-end career mapping that takes learners from skill mastery to salary.',
  },
  {
    icon: Trophy,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'From Local Classrooms to National Careers',
    description: 'iKlavya ensures that students from smaller cities are not just trained -- they are empowered, employable, and economically independent.',
  },
  {
    icon: Users,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Built for Bharat. Powered by AI.',
    description: 'Multilingual, mobile-first, low-bandwidth optimized, and scalable across colleges, ITIs, and training centers across Tier 2 and Tier 3 India.',
  },
]

const journeySteps = [
  { step: 1, title: 'Assess', desc: 'AI-powered skill and psychometric assessments', borderColor: 'border-green-800', textColor: 'text-green-800' },
  { step: 2, title: 'Identify', desc: 'Discover strengths, gaps, and career direction', borderColor: 'border-amber-700', textColor: 'text-amber-700' },
  { step: 3, title: 'Learn', desc: 'Adaptive AI tutor and smart classroom learning', borderColor: 'border-emerald-700', textColor: 'text-emerald-700' },
  { step: 4, title: 'Prepare', desc: 'AI interviews, resume building, career mapping', borderColor: 'border-orange-600', textColor: 'text-orange-600' },
  { step: 5, title: 'Place', desc: 'Skill-to-job matchmaking and placement', borderColor: 'border-green-800', textColor: 'text-green-800' },
]

const problems = [
  {
    number: '01',
    problem: 'Learners lack workplace readiness',
    solution: 'iKlavya simulates real workplace scenarios with AI-powered interview practice, proctored classrooms, and adaptive skill-building exercises.',
  },
  {
    number: '02',
    problem: 'No personalized learning paths',
    solution: 'Our AI Tutor customizes explanations, pace, and practice based on each learner\'s strengths, gaps, and learning style.',
  },
  {
    number: '03',
    problem: 'Tier 2 & 3 students lack equal opportunity',
    solution: 'iKlavya ensures students from smaller cities are empowered, employable, and economically independent through mobile-first, multilingual AI skilling.',
  },
]

const contactInfo = [
  { icon: Phone, label: '+91 95991 71744', href: 'tel:+919599171744' },
  { icon: Mail, label: 'contact@iklavya.in', href: 'mailto:contact@iklavya.in' },
  { icon: Globe, label: 'www.iklavya.in', href: 'https://www.iklavya.in' },
  { icon: MapPin, label: 'Gaur City, Greater Noida West, Uttar Pradesh', href: null },
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
                Empowering India&apos;s
                <br />
                <span className="text-green-800">Education</span> &amp; Skilling
                <br />
                Ecosystem with <span className="text-green-800 italic">AI</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-2xl leading-relaxed mb-10">
                iKlavya is building a unified AI-powered infrastructure that transforms how learners
                are trained, assessed, and placed into meaningful employment. Our solutions enable
                institutions, training partners, and employers to deliver measurable learning outcomes
                and guaranteed job readiness.
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

      {/* ===== SECTION 2: Mission & Vision ===== */}
      <section className="bg-white border-y border-slate-100 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Mission */}
            <RevealSection>
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Our Mission
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-snug mt-4">
                  To deliver affordable, multilingual AI skilling and career intelligence to{' '}
                  <span className="text-green-800">1 million underserved learners</span>,
                  enabling skill mastery, job readiness, and income-generating opportunities
                  across Tier 2 and Tier 3 India.
                </h2>
              </div>
            </RevealSection>

            {/* Vision */}
            <RevealSection>
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                  Our Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-snug mt-4">
                  To create a future where careers across <span className="text-green-800">India</span> are
                  built and accelerated through <span className="text-green-800">AI</span>.
                </h2>
                <p className="text-lg text-slate-500 font-light leading-relaxed mt-4">
                  We envision an ecosystem where technology bridges opportunity gaps, empowers
                  learners with in-demand skills, and enables individuals from all backgrounds
                  to participate meaningfully in the evolving digital economy.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: Built for Bharat ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-16">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                Built for Bharat
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Built for Bharat. Powered by AI.
              </h2>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <RevealSection>
              <div className="space-y-5">
                {builtForBharat.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <item.icon className={`${item.iconColor} w-6 h-6 flex-shrink-0 mt-0.5`} />
                    <span className="text-lg font-bold text-slate-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </RevealSection>

            <RevealSection>
              <div className="relative">
                <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
                  {problems.map((item, i) => (
                    <motion.div
                      key={item.number}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className="text-center space-y-3"
                    >
                      <span className="text-5xl font-bold text-stone-200">{item.number}</span>
                      <h3 className="text-sm font-bold text-slate-900">{item.problem}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.solution}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealSection>
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
                A Unified AI-Powered Infrastructure.
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
                    <div className="p-6 sm:p-8 md:p-10">
                      <Image
                        src={feature.image}
                        alt={feature.tag}
                        width={480}
                        height={480}
                        className="w-full h-auto max-h-[400px] object-contain"
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
                  className="rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="h-48 sm:h-56 flex items-center justify-center p-6 overflow-hidden">
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
                  className="rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="h-48 sm:h-56 flex items-center justify-center p-6 overflow-hidden">
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

      {/* ===== SECTION 6: Two Intelligence Pillars ===== */}
      <section id="platform" className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-amber-800 uppercase tracking-[0.4em]">
                Why iKlavya
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Two Pillars of Intelligence. One Platform.
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
                From Classroom to Career in Five Steps.
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

      {/* ===== SECTION 8: Vision Statement ===== */}
      <section className="bg-[#FDFCF6] py-14 sm:py-20 md:py-28">
        <RevealSection>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
              From Local Classrooms to National Careers
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug italic mt-8">
              &ldquo;iKlavya ensures that students from smaller cities are not just
              trained -- they are empowered, employable, and economically independent.&rdquo;
            </h2>

            <p className="text-lg text-slate-500 font-light mt-6">
              Built for Bharat. Powered by AI.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* ===== SECTION 9: Contact & CTA ===== */}
      <section className="bg-green-50/30 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                    Get in Touch
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-3">
                    Our Contact
                  </h3>
                </div>

                <div className="space-y-5">
                  {contactInfo.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-white w-5 h-5" />
                      </div>
                      {item.href ? (
                        <a href={item.href} className="text-slate-700 font-bold hover:text-green-800 transition-colors">
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-slate-700 font-bold">{item.label}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center md:text-left space-y-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900">
                  Your Career Starts Here.
                </h2>

                <p className="text-slate-500 text-lg font-light max-w-md">
                  Join the growing community of learners transforming their potential into
                  professional readiness with iKlavya.
                </p>

                <div className="flex flex-col sm:flex-row items-center md:items-start gap-6">
                  <Link href="/register">
                    <button className="border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                      Get Started Free
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
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  )
}
