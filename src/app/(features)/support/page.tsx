'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Search, MessageCircle, Send, ChevronRight,
  Calendar, Clock, User, CheckCircle, Circle, X
} from 'lucide-react'

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings > Account > Reset Password. You will receive an email with reset instructions.' },
  { q: 'Can I download my certificates?', a: 'Yes! Navigate to Certifications, click on any earned certificate, and hit the Download button.' },
  { q: 'How does the AI interview work?', a: 'Our AI interviewer asks you questions while analyzing your speech, confidence, and content in real-time.' },
  { q: 'Is there a mobile app?', a: 'We are currently working on mobile apps for iOS and Android. Stay tuned for updates!' },
  { q: 'How is my ATS score calculated?', a: 'We analyze keyword relevance, formatting, section completeness, and industry-standard best practices.' },
]

const mentors = [
  { name: 'Dr. Priya Sharma', role: 'Communication Coach', rating: 4.9, slots: ['10:00 AM', '2:00 PM', '4:30 PM'], color: '#1E40AF' },
  { name: 'Rahul Verma', role: 'Leadership Mentor', rating: 4.8, slots: ['9:00 AM', '11:30 AM', '3:00 PM'], color: '#1E40AF' },
  { name: 'Dr. Ananya Desai', role: 'Career Counselor', rating: 4.9, slots: ['10:30 AM', '1:00 PM'], color: '#166534' },
]

const tickets = [
  { id: 'TKT-001', subject: 'Course video not loading', status: 'resolved', date: '2025-01-10' },
  { id: 'TKT-002', subject: 'Certificate name incorrect', status: 'in-review', date: '2025-01-14' },
  { id: 'TKT-003', subject: 'Interview audio issue', status: 'submitted', date: '2025-01-15' },
]

const statusConfig: Record<string, { color: string; label: string }> = {
  submitted: { color: '#1E40AF', label: 'Submitted' },
  'in-review': { color: '#92400E', label: 'In Review' },
  resolved: { color: '#166534', label: 'Resolved' },
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hi! How can I help you today?' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs

  const sendChat = () => {
    if (!chatInput.trim()) return
    setChatMessages((prev) => [...prev, { role: 'user', text: chatInput }])
    setChatInput('')
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: 'Thank you for reaching out. A support agent will be with you shortly. In the meantime, please check our FAQ section.',
        },
      ])
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Support & Mentorship</h1>
          <p className="text-gray-500">Get help and book mentor sessions</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: FAQ + Tickets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200
                  text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-300
                  focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </motion.div>

            {/* FAQs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg bg-gray-50 border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: expandedFaq === i ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={14} className="text-gray-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                {filteredFaqs.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    No results found. Try submitting a support ticket.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Tickets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Your Tickets</h3>
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const config = statusConfig[ticket.status]
                  const stages = ['submitted', 'in-review', 'resolved']
                  const currentStage = stages.indexOf(ticket.status)
                  return (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-400">{ticket.id}</span>
                          <h4 className="text-sm text-gray-700 font-medium">{ticket.subject}</h4>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${config.color}10`, color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                      {/* Pipeline */}
                      <div className="flex items-center gap-1">
                        {stages.map((stage, i) => (
                          <div key={stage} className="flex items-center gap-1 flex-1">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                background: i <= currentStage ? `${statusConfig[stage].color}10` : '#F9FAFB',
                              }}
                            >
                              {i <= currentStage ? (
                                <CheckCircle size={12} style={{ color: statusConfig[stage].color }} />
                              ) : (
                                <Circle size={12} className="text-gray-300" />
                              )}
                            </div>
                            {i < stages.length - 1 && (
                              <div className="flex-1 h-0.5 rounded-full" style={{
                                background: i < currentStage ? statusConfig[stages[i + 1]].color : '#E5E7EB',
                              }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Right: Mentors */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl bg-white border border-gray-200 shadow-sm p-5"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-blue-800" />
                Book a Mentor
              </h3>
              <div className="space-y-4">
                {mentors.map((mentor, i) => (
                  <motion.div
                    key={mentor.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="rounded-lg bg-gray-50 border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: `${mentor.color}10`, color: mentor.color }}
                      >
                        {mentor.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{mentor.name}</h4>
                        <span className="text-xs text-gray-400">{mentor.role}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.slots.map((slot) => (
                        <button
                          key={slot}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-white border border-gray-200
                            text-gray-500 hover:text-blue-800 hover:border-blue-200 transition-all"
                        >
                          <Clock size={10} className="inline mr-1" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mb-4 w-full sm:w-80 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <MessageCircle size={14} className="text-blue-800" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Support Chat</h4>
                    <span className="text-[10px] text-green-600">Online</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="h-60 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-800 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200
                      text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none
                      focus:border-blue-300 transition-all"
                  />
                  <button
                    onClick={sendChat}
                    className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center text-white
                      hover:bg-blue-900 transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-blue-800 hover:bg-blue-900
            flex items-center justify-center text-white shadow-lg transition-colors relative"
        >
          <MessageCircle size={22} />
          {!chatOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px]
              flex items-center justify-center font-bold text-white">
              2
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
