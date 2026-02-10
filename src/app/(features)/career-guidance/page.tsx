'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, User, Bot, Lightbulb } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'ai'
  content: string
  isStreaming?: boolean
}

const quickActions = [
  'What career paths match my skills?',
  'How should I prepare for placements?',
  'Suggest a learning roadmap for AI/ML',
  'Review my interview performance',
]

const aiResponses: Record<string, string> = {
  'What career paths match my skills?':
    'Based on your profile analysis, I see strong potential in **Software Engineering**, **Data Science**, and **Product Management**. Your Python and React skills, combined with your analytical assessments, suggest you would excel in roles that combine technical implementation with data-driven decision making.\n\n**Recommended next steps:**\n1. Complete the System Design course to strengthen your architecture skills\n2. Practice 2-3 mock interviews per week\n3. Build a portfolio project showcasing full-stack + ML capabilities',
  'How should I prepare for placements?':
    'Great question! Based on your current skill assessment scores, here is a **4-week placement prep plan:**\n\n**Week 1:** Focus on DSA fundamentals — complete the coding assessment module daily\n**Week 2:** System design + behavioral interview practice\n**Week 3:** Resume optimization (your ATS score is currently 78 — let us push it to 90+)\n**Week 4:** Full mock interview simulations with our AI interviewer\n\nI have also noticed your communication score could improve. I recommend the Soft Skills course.',
  'Suggest a learning roadmap for AI/ML':
    'Here is your personalized **AI/ML Learning Roadmap:**\n\n**Foundation (Month 1-2):**\n- Python for Data Science *(you are 65% done — finish this first!)*\n- Statistics & Probability basics\n- NumPy, Pandas mastery\n\n**Core ML (Month 3-4):**\n- Supervised & Unsupervised Learning\n- Scikit-learn hands-on projects\n- Feature Engineering\n\n**Advanced (Month 5-6):**\n- Deep Learning with PyTorch\n- NLP or Computer Vision specialization\n- Capstone project\n\nShall I enroll you in the Machine Learning A-Z course?',
  default:
    'I understand your question. Let me analyze your profile data and provide personalized guidance. Based on your assessment scores, course progress, and interview performance, I can see several areas where targeted improvement would make a significant impact on your career readiness.',
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-blue-400"
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100
              flex items-center justify-center">
              <Bot size={20} className="text-blue-800" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Career Coach</h1>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Analyzing your profile...</span>
            </div>
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
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <motion.span
                        className="inline-block ml-0.5 text-blue-500"
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
                className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200
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
              className="w-full px-5 py-3.5 pr-12 rounded-full bg-gray-50 border border-gray-200
                text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-300
                focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                bg-blue-800 flex items-center justify-center
                text-white disabled:opacity-30 disabled:cursor-not-allowed
                hover:bg-blue-900 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
