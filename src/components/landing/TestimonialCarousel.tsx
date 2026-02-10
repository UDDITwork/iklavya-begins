'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    content: 'The AI interview simulator was a game-changer. I practiced daily for 2 weeks and landed my dream job. The real-time feedback on filler words and confidence helped me improve dramatically.',
    avatar: 'PS',
  },
  {
    name: 'Rahul Verma',
    role: 'Data Analyst at Microsoft',
    content: 'Iklavya\'s skill assessment showed me exactly where my gaps were. The AI-generated learning roadmap was incredibly accurate. I went from beginner to advanced in Python within 3 months.',
    avatar: 'RV',
  },
  {
    name: 'Ananya Desai',
    role: 'Product Manager at Flipkart',
    content: 'The resume builder\'s ATS optimization increased my callback rate by 300%. The AI writing suggestions were better than any career counselor I\'ve worked with.',
    avatar: 'AD',
  },
  {
    name: 'Vikram Patel',
    role: 'Full Stack Developer at Paytm',
    content: 'Live quiz broadcasts made learning competitive and fun. I earned 5 certifications that I proudly showcase on my LinkedIn. The certificate verification QR code adds instant credibility.',
    avatar: 'VP',
  },
  {
    name: 'Sneha Iyer',
    role: 'ML Engineer at Amazon',
    content: 'The career guidance AI understood my goals better than any human advisor. It connected insights from my assessments, course progress, and interview performance into one actionable plan.',
    avatar: 'SI',
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((c) => (c + 1) % testimonials.length)
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative py-20 md:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-blue-800 tracking-widest uppercase mb-4 block">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Students Who Made It
          </h2>
        </motion.div>

        <div className="relative">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-8 md:p-12 bg-white border border-gray-200 shadow-sm text-center"
          >
            <Quote size={36} className="mx-auto mb-6 text-gray-200" />
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              &ldquo;{testimonials[current].content}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center font-semibold text-blue-800 text-sm">
                {testimonials[current].avatar}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">
                  {testimonials[current].name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonials[current].role}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-blue-800 w-6'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
