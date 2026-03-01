'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle, ArrowRight, Target, Zap, Users, Shield,
  Clock, TrendingUp, Building2, Award, Handshake,
  BarChart3, Briefcase, UserCheck, Database, MapPin,
  RefreshCw, DollarSign, FileSearch, Mic, Video,
  MessageSquare, Globe, Phone, Mail,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

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

// --- Animated counter ---
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 50, damping: 30 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  if (isInView) motionVal.set(target)

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>{suffix}
    </span>
  )
}

// --- Data ---
const verificationSteps = [
  { icon: FileSearch, label: 'AI-based resume validation', color: 'text-green-800', bg: 'bg-green-50/40' },
  { icon: Target, label: 'Role-specific skill matching', color: 'text-amber-700', bg: 'bg-amber-50/40' },
  { icon: Mic, label: 'Structured interview simulations (text, voice & video)', color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
  { icon: MessageSquare, label: 'Communication readiness evaluation', color: 'text-orange-500', bg: 'bg-orange-50/40' },
  { icon: BarChart3, label: 'Market alignment scoring', color: 'text-green-800', bg: 'bg-green-50/40' },
]

const attritionReasons = [
  'Skill mismatch',
  'Unrealistic expectations',
  'Poor job-role understanding',
  'Lack of career clarity',
]

const costReductions = [
  'Recruitment expenses',
  'Re-hiring costs',
  'Training overhead',
  'Early exit losses',
]

const hiringAdvantages = [
  { icon: UserCheck, label: 'Job-ready candidates', color: 'text-green-800', bg: 'bg-green-50/40' },
  { icon: Clock, label: 'Faster onboarding', color: 'text-amber-700', bg: 'bg-amber-50/40' },
  { icon: TrendingUp, label: 'Lower attrition', color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
  { icon: RefreshCw, label: 'Replacement assurance', color: 'text-orange-500', bg: 'bg-orange-50/40' },
  { icon: DollarSign, label: 'Reduced cost per hire', color: 'text-green-800', bg: 'bg-green-50/40' },
  { icon: Globe, label: 'Nationwide talent access', color: 'text-amber-700', bg: 'bg-amber-50/40' },
  { icon: Shield, label: 'AI-verified talent filtering', color: 'text-emerald-600', bg: 'bg-emerald-50/40' },
]

const bulkHiringTypes = [
  'Campus hiring',
  'Entry-level hiring',
  'Volume recruitment',
  'Multi-location deployment',
]

const indianHiringUnderstanding = [
  'Fresher hiring challenges',
  'Corporate onboarding realities',
  'Skill-demand gaps',
  'Attrition pressures',
  'Cost-per-hire sensitivity',
]

const contactInfo = [
  { icon: Phone, label: '+91 95991 71744', href: 'tel:+919599171744' },
  { icon: Mail, label: 'contact@iklavya.in', href: 'mailto:contact@iklavya.in' },
  { icon: Globe, label: 'www.iklavya.in', href: 'https://www.iklavya.in' },
  { icon: MapPin, label: 'Gaur City, Greater Noida West, Uttar Pradesh', href: null },
]

export default function ForEmployersPage() {
  return (
    <div className="selection:bg-green-100">

      {/* ===== HERO ===== */}
      <section className="bg-[#FDFCF6] pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="max-w-5xl">
              <div className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-8">
                <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                  For Employers
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
                Hire Job-Ready Talent.
                <br />
                <span className="text-green-800">Reduce Training Time.</span>
                <br />
                Lower <span className="text-green-800 italic">Attrition</span>.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-3xl leading-relaxed mb-6">
                India&apos;s AI-Verified Talent Pipeline &mdash; Built for Faster, Smarter Hiring.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="mailto:contact@iklavya.in">
                  <button className="border-2 border-green-800 text-green-800 bg-white hover:bg-green-50/50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-green-200/30">
                    Schedule a Hiring Consultation
                  </button>
                </a>
                <a href="mailto:contact@iklavya.in?subject=Candidate%20Access%20Request">
                  <button className="border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                    Request Candidate Access
                  </button>
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="bg-white border-y border-slate-100 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-6">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                  The Hiring Challenge
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-snug">
                  Hiring fresh graduates is <span className="text-green-800">expensive</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Not just because of recruitment costs &mdash; but because of training time,
                  productivity delays, and early attrition.
                </p>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Most companies spend <span className="font-bold text-slate-900">45&ndash;60 days</span> training
                  new hires before they become productive. Many leave within the first 3 months,
                  forcing you to restart the hiring cycle.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { number: '45-60', label: 'Days Average Training Time', color: 'text-orange-500' },
                  { number: '3', label: 'Months Before Early Exits', color: 'text-red-500' },
                  { number: 'High', label: 'Recruitment Restart Costs', color: 'text-amber-700' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-5"
                  >
                    <span className={`text-3xl sm:text-4xl font-bold ${stat.color} font-serif`}>{stat.number}</span>
                    <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </RevealSection>

          <RevealSection className="mt-16">
            <div className="bg-green-50/40 border-2 border-green-800 rounded-2xl p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-green-800 mb-4">
                IKLAVYA solves this problem.
              </h3>
              <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
                We deliver pre-evaluated, job-ready, AI-verified candidates who are prepared
                before they enter your organization.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== VERIFIED CANDIDATES ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                AI-Verified Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Iklavya Verified Candidates &mdash; Ready for
                <br className="hidden sm:block" />
                <span className="text-green-800"> Immediate Contribution</span>.
              </h2>
              <p className="text-lg text-slate-600 font-light mt-6 max-w-2xl mx-auto">
                Our candidates are not raw graduates. Before they reach your desk, they go through
                a rigorous AI-powered verification process.
              </p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {verificationSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 flex items-start gap-4 transition-shadow hover:shadow-xl"
              >
                <div className={`${step.bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`${step.color} w-6 h-6`} />
                </div>
                <span className="text-sm font-bold text-slate-700 leading-relaxed mt-2">{step.label}</span>
              </motion.div>
            ))}
          </div>

          <RevealSection>
            <p className="text-center text-xl sm:text-2xl font-serif font-bold text-green-800 italic">
              You hire readiness &mdash; not potential alone.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ===== REDUCE TRAINING TIME ===== */}
      <section className="bg-white py-16 sm:py-20 md:py-28 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Faster Onboarding
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Reduce Training Period from{' '}
                  <span className="text-orange-500 line-through">60 Days</span> to{' '}
                  <span className="text-green-800">2 Weeks</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Traditional freshers require long onboarding cycles. IKLAVYA candidates are trained
                  according to real employer demand and industry expectations. They understand workplace
                  communication, structured reporting, interview culture, and job-role clarity.
                </p>
                <div className="space-y-4">
                  {[
                    'Your teams become productive faster',
                    'Your managers spend less time on basic training',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="relative">
                {/* Training time visual */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traditional Hiring</span>
                      <span className="text-sm font-bold text-orange-500">60 Days</span>
                    </div>
                    <div className="h-3 w-full bg-orange-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full bg-orange-400 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">With IKLAVYA</span>
                      <span className="text-sm font-bold text-green-800">14 Days</span>
                    </div>
                    <div className="h-3 w-full bg-green-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '23%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        className="h-full bg-green-600 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 text-center">
                    <span className="text-3xl sm:text-4xl font-bold text-green-800">76%</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reduction in Training Time</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ===== REDUCE ATTRITION ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                  Retention Assurance
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Reduce Attrition by Up to{' '}
                  <span className="text-green-800">60%</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Attrition often happens because of:
                </p>
                <div className="space-y-3">
                  {attritionReasons.map((reason, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <span className="text-sm font-bold text-slate-700">{reason}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Our AI Skill-to-Job Matchmaking ensures role alignment before hiring.
                  Candidates understand the job expectations clearly before joining.
                </p>
                <p className="text-xl font-serif font-bold text-green-800 italic">
                  Better alignment leads to better retention.
                </p>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="space-y-6">
                {/* 90-Day Guarantee Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-800 space-y-5 transition-shadow hover:shadow-2xl"
                >
                  <div className="bg-green-50/40 w-14 h-14 rounded-2xl flex items-center justify-center">
                    <Shield className="text-green-800 w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">90-Day Replacement Guarantee</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Hiring always carries risk. To reduce that risk, we offer a 90-day replacement
                    guarantee. If a candidate exits within the first 90 days, we provide a replacement
                    without restarting your hiring cycle from scratch.
                  </p>
                  <p className="text-sm font-bold text-green-800">
                    Operational security and cost protection &mdash; built in.
                  </p>
                </motion.div>

                {/* Cost Per Hire Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-5 transition-shadow hover:shadow-xl"
                >
                  <div className="bg-amber-50/40 w-14 h-14 rounded-2xl flex items-center justify-center">
                    <DollarSign className="text-amber-700 w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Lowest Industry Cost Per Hire</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Recruitment agencies often charge high percentages without guaranteeing readiness
                    or retention. IKLAVYA operates on optimized, industry-competitive hiring models
                    designed to lower your cost per hire while maintaining candidate quality.
                  </p>
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">You reduce:</p>
                    {costReductions.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-amber-700">
                    Hiring becomes predictable and efficient.
                  </p>
                </motion.div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ===== VERIFIED DATABASE ===== */}
      <section className="bg-white py-12 sm:py-16 md:py-20 border-y border-slate-100">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { target: 100000, suffix: '+', label: 'Verified Candidates', color: 'text-green-800' },
                { target: 90, suffix: ' Days', label: 'Replacement Guarantee', color: 'text-emerald-600' },
                { target: 60, suffix: '%', label: 'Attrition Reduction', color: 'text-orange-500' },
                { target: 76, suffix: '%', label: 'Training Time Saved', color: 'text-amber-800' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className={`text-3xl sm:text-4xl md:text-5xl font-bold ${stat.color}`}>
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

      {/* ===== DATABASE ACCESS ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                  Talent Database
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Access to a Verified Database of{' '}
                  <span className="text-green-800">1,00,000+</span> Candidates.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  We maintain a structured, AI-evaluated database of over 1,00,000+ applicants across India.
                  Candidates are:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Profiled', 'Assessed', 'Skill-mapped', 'Verified'].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center"
                    >
                      <CheckCircle className="text-emerald-500 w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  This allows quick shortlisting and faster hiring cycles.
                </p>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                  PAN India Coverage
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                  Bulk Hiring Support &mdash; PAN India.
                </h2>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  Whether you require:
                </p>
                <div className="space-y-4">
                  {bulkHiringTypes.map((item, i) => (
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
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  IKLAVYA supports hiring across PAN India. We streamline screening, evaluation,
                  and matching at scale.
                </p>
                <p className="text-lg font-serif font-bold text-green-800 italic">
                  Structured bulk hiring &mdash; without compromising quality.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ===== BUILT FOR INDIAN EMPLOYERS ===== */}
      <section className="bg-white py-16 sm:py-20 md:py-28 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                Built for India
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4">
                Built for Indian Employers.
              </h2>
              <p className="text-lg text-slate-600 font-light mt-6 max-w-2xl mx-auto">
                Our AI system is built specifically for Indian hiring standards and industry expectations.
                Not generic global standards.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="bg-[#FDFCF6] rounded-3xl p-8 sm:p-12 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    We Understand
                  </span>
                  <div className="space-y-4">
                    {indianHiringUnderstanding.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="text-amber-500 w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-base text-slate-600 font-light leading-relaxed mt-4">
                    We prepare candidates according to what Indian companies actually expect.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight mb-8">
                    The IKLAVYA <span className="text-green-800">Hiring Advantage</span>.
                  </h3>
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="space-y-3"
                  >
                    {hiringAdvantages.map((item) => (
                      <motion.div
                        key={item.label}
                        variants={staggerItem}
                        className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                      >
                        <div className={`${item.bg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <item.icon className={`${item.color} w-5 h-5`} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="text-lg font-serif font-bold text-slate-900 mt-6 italic">
                    You don&apos;t just hire graduates. You hire <span className="text-green-800">prepared professionals</span>.
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== SMARTER PIPELINE ===== */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-16">
              <span className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em]">
                Transform Your Hiring
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Build a Smarter Hiring Pipeline
                <br className="hidden sm:block" />
                with <span className="text-green-800">IKLAVYA</span>.
              </h2>
            </div>
          </RevealSection>

          <RevealSection>
            <div className="max-w-3xl mx-auto space-y-6 mb-16">
              {[
                'Stop spending months training candidates who are not role-ready.',
                'Stop restarting hiring cycles because of early exits.',
                'Stop paying high recruitment costs without performance assurance.',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-lg text-slate-700 font-light">{item}</span>
                </motion.div>
              ))}
            </div>
          </RevealSection>

          <RevealSection>
            <div className="text-center mb-12">
              <p className="text-xl sm:text-2xl text-slate-700 font-light">
                With IKLAVYA, you hire candidates who are:
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { label: 'AI-verified', icon: Shield, color: 'border-green-800', textColor: 'text-green-800', bg: 'bg-green-50/40' },
              { label: 'Skill-aligned', icon: Target, color: 'border-amber-700', textColor: 'text-amber-700', bg: 'bg-amber-50/40' },
              { label: 'Interview-prepared', icon: Video, color: 'border-emerald-700', textColor: 'text-emerald-700', bg: 'bg-emerald-50/40' },
              { label: 'Market-ready', icon: Briefcase, color: 'border-orange-600', textColor: 'text-orange-600', bg: 'bg-orange-50/40' },
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

          <RevealSection>
            <div className="text-center space-y-4">
              <p className="text-lg text-slate-600 font-light">
                Reduce training time. Lower attrition. Increase productivity from day one.
              </p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-green-800 italic">
                Hire smarter. Hire prepared. Hire IKLAVYA Verified.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ===== CTA & CONTACT ===== */}
      <section className="bg-green-50/30 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                    Partner With IKLAVYA Today
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-3 leading-tight">
                    Let&apos;s build a faster, more reliable hiring pipeline for your organization.
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

              {/* CTA Buttons */}
              <div className="text-center md:text-left space-y-8">
                <div className="space-y-4">
                  <a href="mailto:contact@iklavya.in" className="block">
                    <button className="w-full sm:w-auto border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                      Schedule a Hiring Consultation
                    </button>
                  </a>
                  <a href="mailto:contact@iklavya.in?subject=Candidate%20Access%20Request" className="block">
                    <button className="w-full sm:w-auto border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                      Request Candidate Access
                    </button>
                  </a>
                  <a href="mailto:contact@iklavya.in?subject=Bulk%20Hiring%20Drive" className="block">
                    <button className="w-full sm:w-auto border-2 border-amber-700 text-amber-700 hover:bg-amber-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                      Start Your Next Bulk Hiring Drive
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  )
}
