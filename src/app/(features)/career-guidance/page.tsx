'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, User, Bot, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import CareerPathScene from '@/components/illustrations/scenes/CareerPathScene'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
}

const quickActions = [
  'What career paths match my skills?',
  'How should I prepare for placements?',
  'Suggest a roadmap for leadership skills',
  'Review my interview performance',
]

const aiResponses: Record<string, string> = {
  'What career paths match my skills?':
    'Based on your profile analysis, I see strong potential in **Sales & Business Development**, **Management Consulting**, and **Human Resources**. Your communication and confidence scores, combined with your leadership assessments, suggest you would excel in roles that require interpersonal influence and team coordination.\n\n**Recommended next steps:**\n1. Complete the Negotiation Skills course to strengthen your persuasion ability\n2. Practice 2-3 mock interviews per week\n3. Build your portfolio with real-world case studies from the simulation modules',
  'How should I prepare for placements?':
    'Great question! Based on your current skill assessment scores, here is a **4-week placement prep plan:**\n\n**Week 1:** Focus on communication fundamentals — complete the active listening module daily\n**Week 2:** Confidence building + behavioral interview practice\n**Week 3:** Resume optimization (your ATS score is currently 78 — let us push it to 90+)\n**Week 4:** Full mock interview simulations with our AI interviewer\n\nI have also noticed your negotiation score could improve. I recommend the Sales & Persuasion course.',
  'Suggest a roadmap for leadership skills':
    'Here is your personalized **Leadership Development Roadmap:**\n\n**Foundation (Month 1-2):**\n- Communication Mastery *(you are 65% done — finish this first!)*\n- Active Listening & Empathy basics\n- Conflict Resolution essentials\n\n**Core Skills (Month 3-4):**\n- Team Management & Delegation\n- Decision Making under pressure\n- Public Speaking & Presentation\n\n**Advanced (Month 5-6):**\n- Strategic Thinking & Planning\n- Cross-functional Leadership\n- Capstone: Lead a simulated project\n\nShall I enroll you in the Leadership Fundamentals course?',
  default:
    'I understand your question. Let me analyze your profile data and provide personalized guidance. Based on your assessment scores, course progress, and interview performance, I can see several areas where targeted improvement would make a significant impact on your career readiness.',
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-green-700"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function CareerGuidancePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      content:
        'Hello! I am your AI Career Coach. I have analyzed your profile, assessment scores, and course progress. How can I help you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const streamResponse = useCallback((text: string, messageId: number) => {
    let i = 0
    setIsTyping(false)
    const interval = setInterval(() => {
      if (i < text.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: text.slice(0, i + 1), isStreaming: true }
              : m
          )
        )
        i++
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isStreaming: false } : m
          )
        )
        clearInterval(interval)
      }
    }, 15)
  }, [])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return

    const userMsg: Message = { id: Date.now(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    setIsTyping(true)

    const responseText = aiResponses[text] || aiResponses.default
    const aiId = Date.now() + 1

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', content: '', isStreaming: true }])
      streamResponse(responseText, aiId)
    }, 1500)
  }, [streamResponse])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-green-50/40 border border-green-200
              flex items-center justify-center">
              <Bot size={20} className="text-green-800" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">AI Career Coach</h1>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Analyzing your profile...</span>
            </div>
          </div>
          <div className="hidden md:block w-48 h-40">
            <Image src="/career_guidance.png" alt="Career Guidance" width={200} height={160} className="object-contain w-full h-full" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-green-50/40 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[90%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'border-2 border-green-800 text-green-800 bg-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <motion.span
                        className="inline-block ml-0.5 text-green-700"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        |
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Bot size={14} />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="px-3 py-2 min-h-[40px] rounded-full bg-gray-50 border border-gray-200
                  text-xs text-gray-500 whitespace-nowrap hover:text-gray-700 hover:border-gray-300
                  transition-all"
              >
                <Lightbulb size={10} className="inline mr-1" />
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your career path, skills, or interview prep..."
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 min-h-[44px] pr-12 rounded-full bg-gray-50 border border-gray-200
                text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400
                focus:ring-2 focus:ring-green-100 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                border-2 border-green-800 bg-white flex items-center justify-center
                text-green-800 disabled:opacity-30 disabled:cursor-not-allowed
                hover:bg-green-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
