'use client'

import { Twitter, Linkedin, Instagram, Send, Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

const footerSections = {
  Platform: [
    { label: 'AI Mock Interview', href: '/ai-interview' },
    { label: 'Video Courses', href: '/ai-courses' },
    { label: 'Resume Builder', href: '/resume-builder' },
    { label: 'Skill Assessment', href: '/skill-assessment' },
    { label: 'Live Quiz', href: '/live-quiz' },
    { label: 'Career Guidance', href: '/career-guidance' },
    { label: 'Certifications', href: '/certifications' },
  ],
  'Who We Serve': [
    { label: 'For Students', href: '/students' },
    { label: 'For Institutions', href: '/institutions' },
    { label: 'For Employers', href: '/for-employers' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Classroom', href: '/classroom' },
    { label: 'Support', href: '/support' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/support' },
  ],
}

const socialIcons = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

const partnerLogos = [
  { src: '/1.png', alt: 'MeitY - Ministry of Electronics & IT' },
  { src: '/2.png', alt: 'ElevenLabs' },
  { src: '/3.png', alt: 'DLabs - Indian School of Business' },
  { src: '/4.png', alt: 'I-Venture Immersive' },
  { src: '/5.png', alt: 'ISB - Indian School of Business' },
  { src: '/6.png', alt: 'AIC - Indian School of Business' },
  { src: '/7.png', alt: 'GL Bajaj Center for Research and Incubation' },
  { src: '/8.png', alt: 'MeitY Startup Hub' },
]

export default function CinematicFooter() {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  async function handleSubscribe() {
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubscribing(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubscribed(true)
        setEmail('')
        toast.success('Subscribed successfully! We\'ll keep you updated.')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Subscription failed. Please try again.')
      }
    } catch {
      setSubscribed(true)
      setEmail('')
      toast.success('Thank you! We\'ll keep you updated.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Subtle top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-700/50 to-transparent" />

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8">

        {/* Top: Brand + Links + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-14 border-b border-slate-800/60">

          {/* Brand column — all left-aligned */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block">
              <Image
                src="/iklavya logo.png"
                alt="IKLAVYA"
                width={220}
                height={110}
                className="h-16 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-[13px] leading-relaxed max-w-xs">
              India&apos;s AI-powered career readiness platform. From education to employment &mdash; built for Bharat.
            </p>

            {/* Contact info — lighter icons, no heavy bg boxes */}
            <div className="space-y-2.5 pt-1">
              <a href="tel:+919599171744" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-[13px] group">
                <Phone size={15} className="text-slate-500 group-hover:text-green-500 transition-colors flex-shrink-0" />
                +91 95991 71744
              </a>
              <a href="mailto:contact@iklavya.in" className="flex items-center gap-2.5 text-slate-400 hover:text-white transition-colors text-[13px] group">
                <Mail size={15} className="text-slate-500 group-hover:text-green-500 transition-colors flex-shrink-0" />
                contact@iklavya.in
              </a>
              <div className="flex items-center gap-2.5 text-slate-400 text-[13px]">
                <MapPin size={15} className="text-slate-500 flex-shrink-0" />
                Gaur City, Greater Noida West, UP
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(footerSections).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter column */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mb-2">
              Stay Updated
            </h4>
            <p className="text-slate-400 text-[13px] mb-4">
              Career tips, platform updates &amp; hiring insights.
            </p>
            <div className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (subscribed) setSubscribed(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe() }}
                placeholder="Your email address"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60
                  text-white placeholder:text-slate-500 focus:outline-none
                  focus:border-green-600 focus:ring-1 focus:ring-green-600/30
                  transition-all duration-200 text-sm"
              />
              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className="w-full px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <><Loader2 size={14} className="animate-spin" /> Subscribing...</>
                ) : subscribed ? (
                  <><CheckCircle size={14} /> Subscribed</>
                ) : (
                  <><Send size={14} /> Subscribe</>
                )}
              </button>
            </div>

            {/* Social icons — larger, no borders, more visible */}
            <div className="flex gap-3 mt-5">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-slate-800/60 hover:bg-green-700/20
                    flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Logos Section — all monochrome white for premium look */}
        <div className="py-10 border-b border-slate-800/60">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-8">
            Backed By &amp; Partnered With
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-6 gap-y-6 items-center justify-items-center">
            {partnerLogos.map((logo) => (
              <div
                key={logo.alt}
                className="flex items-center justify-center h-10 sm:h-12 w-full"
                title={logo.alt}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={48}
                  className="max-h-9 sm:max-h-11 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-90 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} IKLAVYA TECHNOLOGIES PVT. LTD. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/support" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span className="text-slate-800">|</span>
            <span className="text-slate-700">Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
