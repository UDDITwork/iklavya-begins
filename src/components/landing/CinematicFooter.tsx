'use client'

import { Github, Twitter, Linkedin, Instagram, Send, Mail } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  Platform: [
    { label: 'AI Interview', href: '/ai-interview' },
    { label: 'Video Courses', href: '/ai-courses' },
    { label: 'Resume Builder', href: '/resume-builder' },
    { label: 'Skill Assessment', href: '/skill-assessment' },
    { label: 'Live Quiz', href: '/live-quiz' },
  ],
  Resources: [
    { label: 'Career Guidance', href: '/career-guidance' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'Mentorship', href: '/support' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/support' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'For Institutions', href: '/about#institutions' },
    { label: 'For Employers', href: '/for-employers' },
    { label: 'Team', href: '/team' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

const socialIcons = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function CinematicFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer className="relative bg-slate-900 text-white pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top section: Brand + Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 pb-10 border-b border-slate-700/50">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <Image
                src="/iklavya logo.png"
                alt="iKlavya"
                width={160}
                height={80}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered student career readiness platform. Build skills, ace interviews, launch careers &mdash; Built for Bharat.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 mt-5">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center
                    text-slate-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest features and career tips in your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700
                  text-white placeholder:text-slate-500 focus:outline-none
                  focus:border-green-500 focus:ring-1 focus:ring-green-500/20
                  transition-all duration-200 text-sm"
              />
              <button className="px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors duration-200 flex items-center gap-2">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-10">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} IKLAVYA TECHNOLOGIES. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span className="text-slate-700">|</span>
            <Link href="/support" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span className="text-slate-700">|</span>
            <a href="mailto:support@iklavya.in" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <Mail size={12} /> support@iklavya.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
