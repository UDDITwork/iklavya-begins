'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle, ArrowRight, Target, Zap, Trophy, Users,
  Phone, Mail, Globe, MapPin, GraduationCap, Briefcase,
  ShieldCheck, BookOpen, BarChart3, Building2, Award, Handshake,
  TrendingUp,
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
    shortDescription: 'ATS-verified resume creation, AI-powered cover letters, personal interview preparation through text, voice and video, and group discussion training \u2014 all trained on Indian hiring data.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_54_03 PM.png',
    link: '/ai-interview',
  },
  {
    tag: 'AI Skill-to-Job Matchmaking',
    tagColor: 'text-orange-600',
    title: 'The Right Candidate. The Right Role.',
    shortDescription: 'Our AI evaluates your skills vs active job requirements \u2014 showing strengths, gaps, best-fit roles, and selection probability. Matching you with the right opportunity.',
    image: '/about graphics/ChatGPT Image Feb 15, 2026, 06_36_04 PM.png',
    link: '/career-guidance',
  },
  {
    tag: 'Career Guidance',
    tagColor: 'text-green-800',
    title: 'A Personal AI Coach That Knows Your Path.',
    shortDescription: 'Our AI analyzes your skills, strengths, and market demand trends to suggest practical career paths \u2014 step-by-step growth roadmaps toward your target role.',
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
    title: 'IKLAVYA Verified Student Advantage.',
    shortDescription: 'Earned. Evaluated. Employer-Ready. Assessment completion, ATS-approved resume, interview validation, skill scoring, and priority visibility to 150+ companies.',
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
    title: 'We Optimize Your Resume',
    description: 'ATS-verified resume creation and AI-generated cover letters tailored per job description \u2014 so your application gets seen, not filtered out.',
  },
  {
    icon: Target,
    iconColor: 'text-green-800',
    iconBg: 'bg-green-50/40',
    title: 'We Strengthen Your Interviews',
    description: 'Personal interview preparation through text, voice, and video. HR, technical, behavioral, and salary negotiation practice with structured feedback on Indian formats.',
  },
  {
    icon: Trophy,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'We Close Skill Gaps & Guide Career Direction',
    description: 'Our AI analyzes your skills, strengths, and market demand trends to suggest practical career paths. We close gaps in communication, negotiation, and workplace readiness.',
  },
  {
    icon: Users,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'We Match & Connect You to Employers',
    description: 'IKLAVYA Verified Students get matched and connected with 150+ employers. You are verified, refined, and then introduced. Not the other way around.',
  },
]

const journeySteps = [
  { step: 1, title: 'Assess', desc: 'AI-powered skill and psychometric assessments', borderColor: 'border-green-800', textColor: 'text-green-800' },
  { step: 2, title: 'Identify', desc: 'Discover strengths, gaps, and career direction', borderColor: 'border-amber-700', textColor: 'text-amber-700' },
  { step: 3, title: 'Learn', desc: 'Adaptive AI tutor and smart classroom learning', borderColor: 'border-emerald-700', textColor: 'text-emerald-700' },
  { step: 4, title: 'Prepare', desc: 'AI interviews, resume building, career mapping', borderColor: 'border-orange-600', textColor: 'text-orange-600' },
  { step: 5, title: 'Place', desc: 'Verified access to 150+ MNCs through assured placement pathway', borderColor: 'border-green-800', textColor: 'text-green-800' },
]

const problems = [
  {
    number: '01',
    problem: 'Resumes fail before recruiters see them',
    solution: 'Our AI aligns your resume with the right keywords, skills, and achievements \u2014 tailored per job description. ATS filters no longer reject you silently.',
  },
  {
    number: '02',
    problem: 'No preparation aligned to real hiring expectations',
    solution: 'Our AI is trained on Indian interview formats \u2014 HR, technical, behavioral, salary negotiation \u2014 with practice through text, voice, and video and structured feedback.',
  },
  {
    number: '03',
    problem: 'Skill mismatch and no employer access',
    solution: 'iKlavya Verified Students get access to 150+ MNCs. We prepare first \u2014 resume, interviews, communication, skill matching \u2014 then introduce you to employers.',
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
              <Image
                src="/iklavya logo.png"
                alt="iKlavya"
                width={180}
                height={90}
                className="h-20 w-auto object-contain mb-8"
                priority
              />

              <div className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-8">
                <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                  About iKlavya
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
                From Educated to
                <br />
                <span className="text-green-800">Employed</span> &mdash; India&apos;s Own
                <br />
                AI <span className="text-green-800 italic">Career System</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-2xl leading-relaxed mb-10">
                Every year, millions graduate &mdash; but only a small percentage feel truly confident
                for interviews. The problem is not intelligence, it&apos;s preparation aligned to real
                hiring expectations. Most tools are built for global markets. iKlavya is different &mdash;
                our own AI model, purpose-built for Indian youth and Indian employers.
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
                  We take you from being an educated person to becoming a{' '}
                  <span className="text-green-800">job-ready, employable professional</span>.
                  Affordable, multilingual AI skilling and career intelligence for
                  1 million learners across Tier 2 and Tier 3 India.
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
                Our Own AI Job Readiness Suite
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-4">
                Everything Powered by In-House AI, Trained on Indian Hiring Data.
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
                Why iKlavya Is Different
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                What We Actually Do for You.
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

      {/* ===== SECTION 6.5: Institutional Partnership ===== */}
      <section id="institutions" className="bg-white py-16 sm:py-20 md:py-28 border-t border-slate-100 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-32 -left-48 w-96 h-96 bg-green-200/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-32 -right-48 w-96 h-96 bg-amber-200/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Hero */}
          <RevealSection>
            <div className="text-center mb-16 sm:mb-20">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-block text-sm font-black text-green-800 uppercase tracking-[0.4em] px-5 py-2.5 bg-green-50/60 border border-green-200/50 rounded-full"
              >
                For Institutions
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-6 leading-tight">
                India&apos;s AI-Powered Placement Infrastructure <br className="hidden sm:block" />
                for <span className="text-green-800 italic">Forward-Thinking</span> Institutions.
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed mt-6">
                Partner with us to strengthen placements, reputation &amp; employer trust. Today, institutions are judged not only by academic results &mdash; but by placement success, employer relationships, and student outcomes.
              </p>
            </div>
          </RevealSection>

          {/* Stakeholder needs — elevated cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {[
              { icon: GraduationCap, label: 'Students want jobs', color: 'border-green-800', textColor: 'text-green-800', glow: 'shadow-green-100/60' },
              { icon: ShieldCheck, label: 'Parents want assurance', color: 'border-amber-700', textColor: 'text-amber-700', glow: 'shadow-amber-100/60' },
              { icon: BookOpen, label: 'Accreditation bodies want measurable data', color: 'border-emerald-700', textColor: 'text-emerald-700', glow: 'shadow-emerald-100/60' },
              { icon: Briefcase, label: 'Employers want job-ready candidates', color: 'border-orange-600', textColor: 'text-orange-600', glow: 'shadow-orange-100/60' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-white border-2 ${item.color} rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl ${item.glow} transition-all duration-300 cursor-default`}
              >
                <div className={`${item.textColor} mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-100`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <RevealSection>
            <div className="text-center mb-16 sm:mb-20">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-green-800 italic"
              >
                IKLAVYA partners with institutions to deliver all four.
              </motion.p>
              <p className="text-base sm:text-lg text-slate-600 font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                We work with colleges to directly onboard students into our AI-powered Career Readiness System &mdash; ensuring they graduate not just with degrees, but with employability proof.
              </p>
            </div>
          </RevealSection>

          {/* Strategic Partnership + Onboarding — split with accent borders */}
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-8 md:gap-0 mb-16 sm:mb-24">
              <div className="space-y-6 p-6 sm:p-8 md:p-10 md:border-r border-slate-100">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">A Strategic Placement Partnership</span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  This Is Not Competition. <br />
                  This Is <span className="text-green-800">Infrastructure Support</span> for Your Placement Ecosystem.
                </h3>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  When institutions collaborate with IKLAVYA, your placement ecosystem gains technology-backed structure, employer confidence, and measurable outcomes.
                </p>
                <div className="space-y-5">
                  {[
                    'Your students get structured placement preparation',
                    'Your placement rates improve',
                    'Your employer network strengthens',
                    'Your institutional brand gains credibility',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-green-50/30 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-emerald-500 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Direct Student Onboarding */}
              <div className="space-y-6 p-6 sm:p-8 md:p-10">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Direct Student Onboarding</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Structured &amp; Transparent
                </h3>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  We work with institutions to onboard students directly into the IKLAVYA Career System under an institutional partnership model. This ensures:
                </p>
                <div className="space-y-5">
                  {[
                    'Every participating student receives AI-based readiness assessment',
                    'Skill gaps are identified early',
                    'Resume quality is standardized',
                    'Interview preparation becomes structured',
                    'Job matching becomes intelligent',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50/30 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-emerald-500 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-lg font-serif font-bold text-green-800 italic mt-4 p-4 bg-green-50/30 rounded-xl border border-green-100"
                >
                  The result? Your students enter placement season prepared &mdash; not panicked.
                </motion.p>
              </div>
            </div>
          </RevealSection>

          {/* 6 benefit cards — with accent borders */}
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-block text-sm font-black text-green-800 uppercase tracking-[0.4em] px-5 py-2.5 bg-green-50/60 border border-green-200/50 rounded-full"
              >
                Partnership Benefits
              </motion.span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-6">
                What Your Institution Gains.
              </h2>
            </div>
          </RevealSection>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 sm:mb-24"
          >
            {[
              {
                icon: Building2,
                iconColor: 'text-green-800',
                iconBg: 'bg-green-50/40',
                borderAccent: 'border-t-green-800',
                title: 'Strengthening Your Placement Cell',
                description: 'Setting up or optimizing placement cells, creating structured placement databases, building employer communication systems, and tracking placement performance year-wise. Your institution operates with an organized, technology-backed system.',
              },
              {
                icon: TrendingUp,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                borderAccent: 'border-t-emerald-600',
                title: 'Improved Placement Rates',
                description: 'Our in-house AI model evaluates communication readiness, interview performance, skill-to-job alignment, and resume quality. Better preparation leads to higher shortlisting, better interview performance, and improved offer conversion.',
              },
              {
                icon: Target,
                iconColor: 'text-orange-500',
                iconBg: 'bg-orange-50',
                borderAccent: 'border-t-orange-500',
                title: 'Employer-Aligned Training',
                description: 'We train students in in-demand skills, prepare them for real hiring formats, conduct AI-powered mock interviews, simulate group discussions, and improve professional communication. Your students become employer-ready.',
              },
              {
                icon: Handshake,
                iconColor: 'text-amber-700',
                iconBg: 'bg-amber-50',
                borderAccent: 'border-t-amber-700',
                title: 'Bringing Reputed Employers to Campus',
                description: 'Through our verified student model, employers gain confidence in candidate quality. This improves employer visits, campus hiring drives, and long-term corporate relationships. Your institution becomes known for prepared talent.',
              },
              {
                icon: Zap,
                iconColor: 'text-green-800',
                iconBg: 'bg-green-50/40',
                borderAccent: 'border-t-green-800',
                title: 'AI-Based Infrastructure Support',
                description: 'AI-proctored assessment classrooms, AI-based student performance evaluation, AI tutoring support, and structured placement data management. You gain measurable insights instead of assumptions.',
              },
              {
                icon: Award,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                borderAccent: 'border-t-emerald-600',
                title: 'NAAC & Accreditation Support',
                description: 'Organized placement databases, employer engagement records, skill development documentation, and structured reporting data. This supports accreditation documentation and institutional audits.',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`bg-white p-8 rounded-2xl shadow-xl border border-slate-100 border-t-4 ${item.borderAccent} flex flex-col space-y-5 transition-all duration-300 hover:shadow-2xl`}
              >
                <div className={`${item.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm`}>
                  <item.icon className={`${item.iconColor} w-7 h-7`} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Why Institutions Partner — premium card */}
          <RevealSection>
            <div className="bg-gradient-to-br from-[#FDFCF6] to-green-50/20 rounded-3xl p-8 sm:p-12 md:p-16 mb-16 sm:mb-24 shadow-lg border border-green-100/50">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">Why Institutions Partner With IKLAVYA</span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    We Do Not Take Students Away. <br />
                    We Help Institutions Produce <span className="text-green-800">Employable Graduates</span> at Scale.
                  </h3>
                  <div className="space-y-5">
                    {[
                      'Increase placement readiness at scale',
                      'Strengthen employer confidence',
                      'Provide measurable performance data',
                      'Enhance institutional reputation',
                      'Build long-term employability systems',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                          <CheckCircle className="text-emerald-500 w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 bg-white/60 rounded-2xl p-6 sm:p-8 border border-slate-100">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Built for Indian Colleges. Built for Indian Employers.</span>
                  <p className="text-base text-slate-600 font-light leading-relaxed">
                    Our AI system is designed specifically for the Indian education ecosystem and Indian hiring standards.
                  </p>
                  <div className="space-y-4">
                    {[
                      'Campus placement pressures',
                      'Tier 2 & Tier 3 institutional realities',
                      'Employer expectations in India',
                      'The importance of measurable outcomes',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="text-amber-500 w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">We understand: {item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-base text-slate-600 font-light leading-relaxed mt-4">
                    IKLAVYA becomes your placement technology partner &mdash; working alongside you to deliver stronger results.
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Closing CTA — premium card treatment */}
          <RevealSection>
            <div className="text-center">
              <div className="inline-block bg-gradient-to-br from-white to-green-50/20 rounded-3xl shadow-2xl shadow-green-100/30 border border-slate-100 px-8 sm:px-16 py-10 sm:py-14 max-w-4xl">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug italic">
                  &ldquo;The future of education is employability. With IKLAVYA as your placement partner, your institution can lead that future &mdash; producing job-ready graduates trusted by Indian employers.&rdquo;
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                  <a href="mailto:contact@iklavya.in">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-green-200/30"
                    >
                      Partner With IKLAVYA
                    </motion.button>
                  </a>
                  <a
                    href="tel:+919599171744"
                    className="text-slate-700 font-black uppercase text-xs tracking-[0.2em] underline decoration-green-700 decoration-4 underline-offset-8 hover:text-green-800 transition-colors"
                  >
                    Speak With Our Team
                  </a>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== SECTION 6.5: For Employers ===== */}
      <section id="employers" className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <RevealSection>
            <div className="text-center mb-16 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                For Employers
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Hire Job-Ready Talent. <br className="hidden sm:block" />
                <span className="text-green-800 italic">Reduce Training Time.</span> Lower Attrition.
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed mt-6">
                India&apos;s AI-Verified Talent Pipeline &mdash; Built for Faster, Smarter Hiring.
                Hiring fresh graduates is expensive &mdash; not just because of recruitment costs,
                but because of training time, productivity delays, and early attrition.
                IKLAVYA delivers pre-evaluated, job-ready, AI-verified candidates who are prepared
                before they enter your organization.
              </p>
            </div>
          </RevealSection>

          {/* Key metrics */}
          <RevealSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
              {[
                { icon: Building2, label: 'Training: 60 days to 2 weeks', color: 'border-green-800', textColor: 'text-green-800', bg: 'bg-green-50/40' },
                { icon: TrendingUp, label: 'Reduce attrition by up to 60%', color: 'border-amber-700', textColor: 'text-amber-700', bg: 'bg-amber-50/40' },
                { icon: ShieldCheck, label: '90-day replacement guarantee', color: 'border-emerald-700', textColor: 'text-emerald-700', bg: 'bg-emerald-50/40' },
                { icon: Users, label: '1,00,000+ verified candidates', color: 'border-orange-600', textColor: 'text-orange-600', bg: 'bg-orange-50/40' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`${item.bg} border-2 ${item.color} rounded-2xl p-6 text-center space-y-3`}
                >
                  <div className={`${item.textColor} mx-auto w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          {/* AI Verification + Benefits */}
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16 sm:mb-24">
              <div className="space-y-6">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">AI-Verified Candidates</span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                  Iklavya Verified Candidates &mdash; Ready for{' '}
                  <span className="text-green-800">Immediate Contribution</span>.
                </h3>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  Our candidates are not raw graduates. Before they reach your desk, they go through:
                </p>
                <div className="space-y-4">
                  {[
                    'AI-based resume validation',
                    'Role-specific skill matching',
                    'Structured interview simulations (text, voice & video)',
                    'Communication readiness evaluation',
                    'Market alignment scoring',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-lg font-serif font-bold text-green-800 italic mt-4">
                  You hire readiness &mdash; not potential alone.
                </p>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Employer Benefits</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  The IKLAVYA <span className="text-green-800">Hiring Advantage</span>.
                </h3>
                <div className="space-y-4">
                  {[
                    'Job-ready candidates from day one',
                    'Faster onboarding &mdash; teams productive sooner',
                    'Lower attrition through AI skill-to-job matching',
                    '90-day replacement guarantee',
                    'Lowest industry cost per hire',
                    'Nationwide talent access &mdash; PAN India',
                    'Bulk hiring support across locations',
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700" dangerouslySetInnerHTML={{ __html: item }} />
                    </motion.div>
                  ))}
                </div>
                <p className="text-lg font-serif font-bold text-slate-900 italic mt-4">
                  You don&apos;t just hire graduates. You hire{' '}
                  <span className="text-green-800">prepared professionals</span>.
                </p>
              </div>
            </div>
          </RevealSection>

          {/* Built for Indian Employers */}
          <RevealSection>
            <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 mb-16 sm:mb-24 shadow-lg border border-slate-100">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">Built for Indian Employers</span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    Our AI Is Built Specifically for <span className="text-green-800">Indian Hiring Standards</span>.
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Fresher hiring challenges',
                      'Corporate onboarding realities',
                      'Skill-demand gaps',
                      'Attrition pressures',
                      'Cost-per-hire sensitivity',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-bold text-slate-700">We understand: {item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-base text-slate-600 font-light leading-relaxed mt-4">
                    We prepare candidates according to what Indian companies actually expect &mdash;
                    not generic global standards.
                  </p>
                </div>

                <div className="text-center space-y-8">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                    Build a Smarter Hiring Pipeline with <span className="text-green-800">IKLAVYA</span>.
                  </h3>
                  <p className="text-base text-slate-600 font-light leading-relaxed">
                    Stop spending months training candidates who are not role-ready.
                    Stop restarting hiring cycles because of early exits.
                    Stop paying high recruitment costs without performance assurance.
                  </p>
                  <p className="text-xl font-serif font-bold text-green-800 italic">
                    Hire smarter. Hire prepared. Hire IKLAVYA Verified.
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Closing CTA */}
          <RevealSection>
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug max-w-3xl mx-auto">
                Let&apos;s build a faster, more reliable hiring pipeline for your organization.
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                <Link href="/for-employers">
                  <button className="border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                    Explore Employer Solutions
                  </button>
                </Link>
                <a
                  href="mailto:contact@iklavya.in"
                  className="text-slate-700 font-black uppercase text-xs tracking-[0.2em] underline decoration-green-700 decoration-4 underline-offset-8 hover:text-green-800 transition-colors"
                >
                  Schedule a Hiring Consultation
                </a>
              </div>
            </div>
          </RevealSection>
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
            <Image
              src="/iklavya logo.png"
              alt="iKlavya"
              width={120}
              height={60}
              className="h-14 w-auto object-contain mx-auto mb-6"
            />

            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
              The Outcome
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug italic mt-8">
              &ldquo;Your degree shows you studied. iKlavya proves you are ready.
              Built in India. Built for Indian youth. Built for Indian employers.&rdquo;
            </h2>

            <p className="text-lg text-slate-500 font-light mt-6">
              From educated graduate &rarr; verified candidate &rarr; confident professional &rarr; real hiring opportunities.
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
                  Your Career is Not a Coincidence.
                </h2>

                <p className="text-slate-500 text-lg font-light max-w-md">
                  We optimize your resume, strengthen your communication, improve your interviews,
                  close skill gaps, guide career direction, match you to opportunities, and connect
                  you with 150+ employers.
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
