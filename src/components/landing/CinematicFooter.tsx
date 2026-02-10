'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Instagram, Mail, Send } from 'lucide-react'
import { useState } from 'react'

const footerLinks = {
  Platform: ['AI Interview', 'Video Courses', 'Resume Builder', 'Skill Assessment', 'Live Quiz'],
  Resources: ['Career Guidance', 'Certifications', 'Mentorship', 'Blog', 'FAQ'],
  Company: ['About Us', 'Team', 'Careers', 'Contact', 'Privacy Policy'],
}

const socialIcons = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

function AnimatedWave() {
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none transform -translate-y-[98%]">
      <svg
        className="relative block w-full h-[60px]"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z"
          fill="#030014"
          animate={{
            d: [
              'M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z',
              'M0,25 C200,0 400,50 600,25 C800,0 1000,50 1200,25 L1200,60 L0,60 Z',
              'M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z',
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  )
}

export default function CinematicFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer className="relative bg-[#030014] pt-20 pb-8 px-4">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 animate-aurora opacity-[0.03]"
          style={{
            background:
              'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6, #06b6d4)',
            backgroundSize: '400% 400%',
          }}
        />
      </div>

      <AnimatedWave />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Newsletter */}
        <motion.div
          className="text-center mb-16 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold gradient-text mb-3">Stay Updated</h3>
          <p className="text-white/40 text-sm mb-6">
            Get the latest features and career tips delivered to your inbox.
          </p>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10
                text-white placeholder:text-white/30 focus:outline-none
                focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]
                transition-all duration-300"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full
              bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm
              hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow">
              <Send size={16} />
            </button>
          </div>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div>
            <motion.h2
              className="text-2xl font-bold gradient-text mb-4 animate-pulse-glow"
              style={{ display: 'inline-block' }}
            >
              IKLAVYA
            </motion.h2>
            <p className="text-white/30 text-sm leading-relaxed">
              AI-powered student career readiness platform. Build skills, ace interviews, launch careers.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p
            className="text-xs text-white/20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            &copy; {new Date().getFullYear()} IKLAVYA. All rights reserved. Built with AI.
          </motion.p>

          {/* Social Icons */}
          <div className="flex gap-3">
            {socialIcons.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/30
                  hover:text-white/80 transition-all duration-300"
                whileHover={{
                  scale: 1.2,
                  rotate: 5,
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                }}
                whileTap={{ scale: 0.9 }}
                aria-label={social.label}
              >
                <social.icon size={16} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
