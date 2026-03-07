'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle, ArrowRight, GraduationCap, Briefcase, Building2,
  Award, Handshake, TrendingUp, BarChart3, Users, Shield,
  FileText, Mic, MessageSquare, Target, BookOpen, ClipboardCheck,
  Database, Globe, Phone, Mail, MapPin, Star, Layers,
  UserCheck, School, LineChart,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

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
          left: `${(i * 17 + 5) % 100}%`,
          top: `${(i * 23 + 10) % 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + (i % 4),
          repeat: Infinity,
          delay: i * 0.3,
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

// ─── Data ───
const stakeholderNeeds = [
  { icon: GraduationCap, label: 'Students want jobs', color: 'text-green-800', bg: 'bg-green-50/60' },
  { icon: Shield, label: 'Parents want assurance', color: 'text-amber-700', bg: 'bg-amber-50/60' },
  { icon: BarChart3, label: 'Accreditation bodies want measurable data', color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
  { icon: Briefcase, label: 'Employers want job-ready candidates', color: 'text-orange-600', bg: 'bg-orange-50/60' },
]

const partnershipBenefits = [
  { icon: Users, label: 'Your students get structured placement preparation' },
  { icon: TrendingUp, label: 'Your placement rates improve' },
  { icon: Handshake, label: 'Your employer network strengthens' },
  { icon: Award, label: 'Your institutional brand gains credibility' },
]

const onboardingSteps = [
  { icon: Target, label: 'AI-based readiness assessment', step: '01' },
  { icon: Layers, label: 'Skill gaps identified early', step: '02' },
  { icon: FileText, label: 'Resume quality standardized', step: '03' },
  { icon: Mic, label: 'Interview preparation structured', step: '04' },
  { icon: Briefcase, label: 'Job matching becomes intelligent', step: '05' },
]

const placementCellSupport = [
  { icon: Building2, label: 'Setting up or optimizing placement cells' },
  { icon: Database, label: 'Creating structured placement databases' },
  { icon: MessageSquare, label: 'Building employer communication systems' },
  { icon: LineChart, label: 'Tracking placement performance year-wise' },
]

const aiEvaluates = [
  'Communication readiness',
  'Interview performance',
  'Skill-to-job alignment',
  'Resume quality',
]

const preparationResults = [
  { label: 'Higher shortlisting', icon: CheckCircle },
  { label: 'Better interview performance', icon: Star },
  { label: 'Improved offer conversion', icon: TrendingUp },
]

const employerTraining = [
  { icon: Target, label: 'Train students in in-demand skills' },
  { icon: Mic, label: 'Conduct AI-powered mock interviews' },
  { icon: Users, label: 'Simulate group discussions' },
  { icon: MessageSquare, label: 'Improve professional communication' },
]

const aiInfrastructure = [
  { icon: ClipboardCheck, label: 'AI-proctored assessment classrooms', color: 'text-green-800', bg: 'bg-green-50/60' },
  { icon: BarChart3, label: 'AI-based student performance evaluation', color: 'text-amber-700', bg: 'bg-amber-50/60' },
  { icon: BookOpen, label: 'AI tutoring support', color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
  { icon: Database, label: 'Structured placement data management', color: 'text-orange-600', bg: 'bg-orange-50/60' },
]

const naacSupport = [
  'Organized placement databases',
  'Employer engagement records',
  'Skill development documentation',
  'Structured reporting data',
]

const whyPartner = [
  { icon: TrendingUp, label: 'Increase placement readiness at scale' },
  { icon: Handshake, label: 'Strengthen employer confidence' },
  { icon: BarChart3, label: 'Provide measurable performance data' },
  { icon: Award, label: 'Enhance institutional reputation' },
  { icon: Layers, label: 'Build long-term employability systems' },
]

const indianRealities = [
  'Campus placement pressures',
  'Tier 2 & Tier 3 institutional realities',
  'Employer expectations in India',
  'The importance of measurable outcomes',
]

const contactInfo = [
  { icon: Phone, label: '+91 95991 71744', href: 'tel:+919599171744' },
  { icon: Mail, label: 'contact@iklavya.in', href: 'mailto:contact@iklavya.in' },
  { icon: Globe, label: 'www.iklavya.in', href: 'https://www.iklavya.in' },
  { icon: MapPin, label: 'Gaur City, Greater Noida West, Uttar Pradesh', href: null },
]

export default function InstitutionsPage() {
  return (
    <div className="selection:bg-green-100">

      {/* ═══════════════════════════════════════════════════════════
          HERO — AI-Powered Placement Infrastructure
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#FDFCF6] pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-28 overflow-hidden">
        <FloatingParticles count={10} />

        {/* Decorative blobs */}
        <BlobShape className="absolute -top-24 -right-24 w-96 h-96 opacity-[0.04]" color="#166534" />
        <BlobShape className="absolute -bottom-32 -left-20 w-80 h-80 opacity-[0.03]" color="#b45309" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <RevealSection>
              <div className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-8">
                <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                  For Institutions
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                India&apos;s AI-Powered
                <br />
                <span className="text-green-800">Placement Infrastructure</span>
                <br />
                for Forward-Thinking
                <br />
                <span className="text-green-800 italic">Institutions</span>.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-light max-w-xl leading-relaxed mb-8">
                Partner With Us to Strengthen Placements, Reputation &amp; Employer Trust.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="mailto:contact@iklavya.in?subject=Institutional%20Partnership%20Inquiry">
                  <button className="border-2 border-green-800 text-green-800 bg-white hover:bg-green-50/50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-green-200/30">
                    Partner With IKLAVYA
                  </button>
                </a>
                <a href="mailto:contact@iklavya.in?subject=Schedule%20a%20Demo">
                  <button className="border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 sm:px-10 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                    Schedule a Demo
                  </button>
                </a>
              </div>
            </RevealSection>

            <RevealSection>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-green-100/40 to-amber-100/30 rounded-3xl blur-2xl" />
                <Image
                  src="/institute-hero.png"
                  alt="Indian students walking from college campus to corporate offices"
                  width={700}
                  height={500}
                  className="relative rounded-2xl w-full h-auto"
                  priority
                />
              </motion.div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════════════════════════════════════════════
          STAKEHOLDER NEEDS — Students, Parents, Accreditation, Employers
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                The Reality
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Today, institutions are judged not only by
                <br className="hidden sm:block" />
                academic results &mdash; but by <span className="text-green-800">placement success</span>.
              </h2>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {stakeholderNeeds.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`${item.bg} p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4 transition-shadow hover:shadow-lg`}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto`}>
                  <item.icon className={`${item.color} w-7 h-7`} />
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <RevealSection>
            <div className="bg-green-50/40 border-2 border-green-800 rounded-2xl p-8 sm:p-12 text-center">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-green-800 mb-4">
                IKLAVYA partners with institutions to deliver all four.
              </h3>
              <p className="text-lg text-slate-600 font-light max-w-3xl mx-auto">
                We work with colleges to directly onboard students into our AI-powered Career Readiness System &mdash;
                ensuring they graduate not just with degrees, but with <span className="font-bold text-slate-900">employability proof</span>.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════════════════════════════════════════════
          STRATEGIC PARTNERSHIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <div className="space-y-6">
                <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                  Strategic Partnership
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  A Strategic <span className="text-green-800">Placement Partnership</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  When institutions collaborate with IKLAVYA:
                </p>
                <div className="space-y-4">
                  {partnershipBenefits.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50/60 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-green-800 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="relative">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border-2 border-green-800 space-y-6 transition-shadow hover:shadow-2xl"
                >
                  <div className="bg-green-50/40 w-14 h-14 rounded-2xl flex items-center justify-center">
                    <Handshake className="text-green-800 w-7 h-7" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    This is not competition.
                  </h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    This is <span className="font-bold text-green-800">infrastructure support</span> for your placement ecosystem.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      We do not take students away from institutions.
                      We help institutions produce <span className="font-bold text-slate-700">employable graduates at scale</span>.
                    </p>
                  </div>
                </motion.div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════════════════════════════════════════════
          STUDENT ONBOARDING PIPELINE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-white py-16 sm:py-20 md:py-28 overflow-hidden">
        <FloatingParticles count={8} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                Structured Onboarding
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Direct Student Onboarding &mdash;
                <br className="hidden sm:block" />
                <span className="text-green-800">Structured &amp; Transparent</span>.
              </h2>
              <p className="text-lg text-slate-600 font-light mt-6 max-w-3xl mx-auto">
                We work with institutions to onboard students directly into the IKLAVYA Career System
                under an institutional partnership model.
              </p>
            </div>
          </RevealSection>

          {/* Pipeline steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {onboardingSteps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="bg-[#FDFCF6] p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3 transition-shadow hover:shadow-lg relative"
              >
                <span className="text-[10px] font-black text-green-800/40 uppercase tracking-widest">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-green-50/60 flex items-center justify-center mx-auto">
                  <item.icon className="text-green-800 w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{item.label}</p>
                {i < onboardingSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-green-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <RevealSection>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-2">The result?</p>
              <p className="text-xl sm:text-2xl font-serif font-bold text-green-800 italic">
                Your students enter placement season prepared &mdash; not panicked.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════════════════════════════════════════════
          STRENGTHENING PLACEMENT CELL + MIDPAGE IMAGE
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/40 to-amber-100/30 rounded-3xl blur-2xl" />
                <Image
                  src="/midpage.png"
                  alt="Students in a structured classroom training session with mentor"
                  width={600}
                  height={430}
                  className="relative rounded-2xl w-full h-auto"
                />
              </motion.div>
            </RevealSection>

            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  Placement Cell Support
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Strengthening Your <span className="text-green-800">Placement Cell</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Instead of last-minute placement efforts, your institution operates with an
                  organized, technology-backed system.
                </p>
                <div className="space-y-4">
                  {placementCellSupport.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-green-800 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════════════════════════════════════════════
          IMPROVED PLACEMENT RATES
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <RevealSection>
              <div className="space-y-6">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                  Measurable Impact
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                  Improved <span className="text-green-800">Placement Rates</span>.
                </h2>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  Higher placement rates come from preparation aligned with employer demand.
                  Our in-house AI model &mdash; built for Indian hiring patterns &mdash; evaluates:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {aiEvaluates.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center"
                    >
                      <CheckCircle className="text-emerald-500 w-5 h-5 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-base text-slate-600 font-light leading-relaxed">
                  We train students according to real employer expectations in India.
                </p>
              </div>
            </RevealSection>

            <RevealSection>
              <div className="space-y-6">
                <div className="bg-[#FDFCF6] rounded-2xl p-8 border border-slate-100 space-y-5">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                    Better Preparation Leads To
                  </span>
                  {preparationResults.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                      className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50/60 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-green-800 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                  <p className="text-base font-serif font-bold text-green-800 italic pt-2">
                    This directly reflects in your placement statistics.
                  </p>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAND
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-green-50/30 py-12 sm:py-16 md:py-20 border-y border-slate-100">
        <RevealSection>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { target: 500, suffix: '+', label: 'Institutions Targeted', color: 'text-green-800' },
                { target: 150, suffix: '+', label: 'Employer Partners', color: 'text-emerald-600' },
                { target: 100000, suffix: '+', label: 'Student Database', color: 'text-orange-500' },
                { target: 90, suffix: '%', label: 'Placement Readiness', color: 'text-amber-800' },
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

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════════════════════════════════════════════
          EMPLOYER-ALIGNED TRAINING + BRINGING EMPLOYERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FDFCF6] py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                Employer Connect
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Employer-Aligned Training &amp;
                <br className="hidden sm:block" />
                <span className="text-green-800">Demand-Based Skilling</span>.
              </h2>
              <p className="text-lg text-slate-600 font-light mt-6 max-w-3xl mx-auto">
                We continuously analyze what Indian employers are actively hiring for.
                Your students become employer-ready &mdash; not just academically qualified.
              </p>
            </div>
          </RevealSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {employerTraining.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4 transition-shadow hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50/60 flex items-center justify-center mx-auto">
                  <item.icon className="text-green-800 w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">{item.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bringing Employers to Campus */}
          <RevealSection>
            <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-100 shadow-lg">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    Campus Recruitment
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    Bringing Reputed Employers to <span className="text-green-800">Campus</span>.
                  </h3>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Through our verified student model, employers gain confidence in candidate quality &mdash;
                    making them more willing to engage with your institution.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Employer visits', icon: Building2 },
                    { label: 'Campus hiring drives', icon: Users },
                    { label: 'Long-term corporate relationships', icon: Handshake },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-[#FDFCF6] p-5 rounded-xl border border-slate-100"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50/60 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-green-800 w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                  <p className="text-base font-serif font-bold text-green-800 italic pt-2">
                    Your institution becomes known for prepared talent.
                  </p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════════════════════════════════════════════
          AI INFRASTRUCTURE + NAAC SUPPORT
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24">
            {/* AI Infrastructure */}
            <RevealSection>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                    Technology Support
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    AI-Based Infrastructure <span className="text-green-800">Support</span>.
                  </h2>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    We help institutions modernize their systems. You gain measurable insights instead of assumptions.
                  </p>
                </div>
                <div className="space-y-4">
                  {aiInfrastructure.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`${item.color} w-5 h-5`} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* NAAC Support */}
            <RevealSection>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                    Accreditation Ready
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                    NAAC &amp; Accreditation <span className="text-green-800">Support</span>.
                  </h2>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    We assist in creating documentation that supports accreditation and institutional audits.
                  </p>
                </div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-[#FDFCF6] p-8 rounded-2xl border-2 border-amber-700/30 space-y-5 transition-shadow hover:shadow-lg"
                >
                  <div className="bg-amber-50/60 w-14 h-14 rounded-2xl flex items-center justify-center">
                    <Award className="text-amber-700 w-7 h-7" />
                  </div>
                  <div className="space-y-3">
                    {naacSupport.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="text-amber-600 w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#FDFCF6" />

      {/* ═══════════════════════════════════════════════════════════
          WHY INSTITUTIONS PARTNER + THIRD IMAGE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#FDFCF6] py-16 sm:py-20 md:py-28 overflow-hidden">
        <FloatingParticles count={8} />
        <BlobShape className="absolute top-10 -right-32 w-96 h-96 opacity-[0.03]" color="#166534" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <RevealSection>
            <div className="text-center mb-14 sm:mb-20">
              <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                The IKLAVYA Advantage
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 mt-4 leading-tight">
                Why Institutions Partner With <span className="text-green-800">IKLAVYA</span>.
              </h2>
            </div>
          </RevealSection>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <RevealSection>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {whyPartner.map((item, i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-lg cursor-default"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50/60 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-green-800 w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>

            <RevealSection>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute -inset-4 bg-gradient-to-bl from-green-100/40 to-amber-100/20 rounded-3xl blur-2xl" />
                <Image
                  src="/third image.png"
                  alt="Confident Indian graduate with degree and briefcase representing employable graduates"
                  width={550}
                  height={400}
                  className="relative rounded-2xl w-full h-auto"
                />
              </motion.div>
            </RevealSection>
          </div>
        </div>
      </section>

      <WaveDivider color="#ffffff" />

      {/* ═══════════════════════════════════════════════════════════
          BUILT FOR INDIAN COLLEGES
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RevealSection>
            <div className="bg-[#FDFCF6] rounded-3xl p-8 sm:p-12 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-sm font-black text-green-800 uppercase tracking-[0.4em]">
                    Built for India
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                    Built for Indian Colleges.
                    <br />
                    Built for Indian <span className="text-green-800">Employers</span>.
                  </h2>
                  <p className="text-lg text-slate-600 font-light leading-relaxed">
                    Our AI system is designed specifically for the Indian education ecosystem
                    and Indian hiring standards. We understand:
                  </p>
                  <div className="space-y-3">
                    {indianRealities.map((item, i) => (
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
                </div>

                <div className="space-y-6">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-800 space-y-5 transition-shadow hover:shadow-2xl"
                  >
                    <div className="bg-green-50/40 w-14 h-14 rounded-2xl flex items-center justify-center">
                      <School className="text-green-800 w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Your Placement Technology Partner
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      IKLAVYA becomes your placement technology partner &mdash;
                      working alongside you to deliver stronger results.
                    </p>
                    <p className="text-lg font-serif font-bold text-green-800 italic">
                      The future of education is employability.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA + CONTACT
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-green-50/30 py-12 sm:py-16 md:py-20">
        <RevealSection>
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">
                    Partner With IKLAVYA Today
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-3 leading-tight">
                    With IKLAVYA as your placement partner, your institution can lead the future &mdash;
                    producing <span className="text-green-800">job-ready graduates</span> trusted by Indian employers.
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

              <div className="text-center md:text-left space-y-8">
                <div className="space-y-4">
                  <a href="mailto:contact@iklavya.in?subject=Institutional%20Partnership%20Inquiry" className="block">
                    <button className="w-full sm:w-auto border-2 border-green-800 text-green-800 hover:bg-green-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg hover:scale-105 transition-all shadow-lg shadow-green-200/30">
                      Partner With IKLAVYA
                    </button>
                  </a>
                  <a href="mailto:contact@iklavya.in?subject=Schedule%20a%20Campus%20Demo" className="block">
                    <button className="w-full sm:w-auto border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                      Schedule a Campus Demo
                    </button>
                  </a>
                  <a href="mailto:contact@iklavya.in?subject=Placement%20Cell%20Setup%20Inquiry" className="block">
                    <button className="w-full sm:w-auto border-2 border-amber-700 text-amber-700 hover:bg-amber-50/50 px-6 sm:px-12 py-4 sm:py-5 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all">
                      Setup Your Placement Cell
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
