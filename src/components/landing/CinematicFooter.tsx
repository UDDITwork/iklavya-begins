'use client'

import { Github, Twitter, Linkedin, Instagram, Send } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

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
    <footer className="relative bg-gray-50 border-t border-gray-200 pt-16 pb-8 px-4 sm:px-6">
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, #60a5fa 30%, #818cf8 50%, #60a5fa 70%, transparent 95%)',
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Newsletter */}
        <div className="text-center mb-14 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-500 text-sm mb-5">
            Get the latest features and career tips delivered to your inbox.
          </p>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 pr-14 rounded-lg bg-white border border-gray-300
                text-gray-900 placeholder:text-gray-400 focus:outline-none
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                transition-all duration-200 text-sm"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-md
              bg-blue-800 hover:bg-blue-900 text-white transition-colors duration-200">
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              IKLAVYA
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              AI-powered student career readiness platform. Build skills, ace interviews, launch careers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
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
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} IKLAVYA. All rights reserved.
          </p>

          <div className="flex gap-3">
            {socialIcons.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center
                  text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200"
                aria-label={social.label}
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
