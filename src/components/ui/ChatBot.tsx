'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Synthesize a pleasant notification chime using Web Audio API
function playChimeSound() {
  try {
    const ctx = new AudioContext()

    // Main tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, ctx.currentTime) // A5
    osc1.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1) // C#6
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2) // E6
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.5)

    // Harmonic shimmer
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.05)
    osc2.frequency.setValueAtTime(2217.46, ctx.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.05)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.05)
    osc2.stop(ctx.currentTime + 0.45)

    // Cleanup
    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Audio not supported
  }
}

// Soft pop sound for sending/receiving messages
function playPopSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
    setTimeout(() => ctx.close(), 300)
  } catch {
    // Audio not supported
  }
}

// Clean floating chat button
function ChatOrb({ isOpen, hasNewMessage }: { isOpen: boolean; hasNewMessage: boolean }) {
  return (
    <div className="relative">
      {/* Pulsing ring when has new message */}
      {hasNewMessage && !isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.592 1.376 4.912 3.543 6.48-.237 1.498-.87 2.87-1.465 3.828a.5.5 0 00.549.746c2.006-.441 3.706-1.2 4.876-1.874.8.136 1.63.22 2.497.22 5.523 0 10-3.813 10-8.5S17.523 2 12 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      {/* Notification dot */}
      {hasNewMessage && !isOpen && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        />
      )}
    </div>
  )
}

// Typing indicator with bouncing dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-emerald-500 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 ml-2">IKLAVYA is thinking...</span>
    </div>
  )
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasPlayedEntry, setHasPlayedEntry] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Hide chatbot for logged-in users (they have the dashboard mentorship chat)
  useEffect(() => {
    const checkAuth = () => {
      const hasCookie = document.cookie.includes('iklavya-token')
      setIsLoggedIn(hasCookie)
    }
    checkAuth()
    // Re-check periodically (login/logout)
    const interval = setInterval(checkAuth, 3000)
    return () => clearInterval(interval)
  }, [])

  if (isLoggedIn) return null
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const controls = useAnimation()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Entry animation + greeting bubble after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true)
      setHasNewMessage(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Play chime on first user interaction with page (after greeting appears)
  useEffect(() => {
    if (!showGreeting || hasPlayedEntry) return

    const handleInteraction = () => {
      playChimeSound()
      setHasPlayedEntry(true)
      // Bounce the orb
      controls.start({
        scale: [1, 1.2, 0.9, 1.1, 1],
        transition: { duration: 0.6 },
      })
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
      document.removeEventListener('mousemove', handleInteraction)
    }

    document.addEventListener('click', handleInteraction, { once: true })
    document.addEventListener('scroll', handleInteraction, { once: true })
    document.addEventListener('mousemove', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
      document.removeEventListener('mousemove', handleInteraction)
    }
  }, [showGreeting, hasPlayedEntry, controls])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const toggleChat = useCallback(() => {
    if (!isOpen) {
      playPopSound()
      setHasNewMessage(false)
      setShowGreeting(false)
    }
    setIsOpen((prev) => !prev)
  }, [isOpen])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    playPopSound()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json()

      if (res.ok && data.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ])
        playPopSound()
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Sorry, something went wrong. Please try again!',
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Connection error. Please check your internet and try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Quick suggestions for new users
  const suggestions = [
    'What is IKLAVYA?',
    'How do AI interviews work?',
    'Help me build a resume',
  ]

  return (
    <>
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed bottom-24 right-6 z-[9998] max-w-[260px] cursor-pointer"
            onClick={toggleChat}
          >
            <div className="relative bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-4 py-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowGreeting(false); setHasNewMessage(false) }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-sm text-gray-700 font-medium">
                Hey! Need help with anything? I&apos;m here to assist you.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-semibold">IKLAVYA AI</span>
              </div>
            </div>
            {/* Triangle pointer */}
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel - slides from right */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998] sm:hidden"
              onClick={toggleChat}
            />

            {/* Main chat panel */}
            <motion.div
              initial={{ x: '110%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '110%', opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 28,
                mass: 0.8,
              }}
              className="fixed bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[400px] h-[min(70vh,560px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 40px rgba(16,185,129,0.1)' }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-5 py-4 flex items-center gap-3 shrink-0">
                <motion.div
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-300 rounded-full border-2 border-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm tracking-wide">IKLAVYA Support</h3>
                  <p className="text-emerald-100 text-xs">AI-powered assistant</p>
                </div>
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-15 15m15 0L4.5 5.25" />
                  </svg>
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
                {/* Welcome message */}
                {messages.length === 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    </motion.div>
                    <h4 className="font-bold text-gray-800 mb-1">Hi there!</h4>
                    <p className="text-gray-500 text-sm mb-5">
                      I&apos;m your IKLAVYA AI assistant. How can I help you today?
                    </p>
                    {/* Quick suggestions */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestions.map((s, i) => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          onClick={() => {
                            setInput(s)
                            setTimeout(() => {
                              const fakeMsg: Message = { role: 'user', content: s }
                              setMessages([fakeMsg])
                              setIsLoading(true)
                              playPopSound()
                              fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ messages: [fakeMsg] }),
                              })
                                .then((r) => r.json())
                                .then((data) => {
                                  setMessages((prev) => [
                                    ...prev,
                                    { role: 'assistant', content: data.message || data.error || 'Sorry, something went wrong.' },
                                  ])
                                  playPopSound()
                                })
                                .catch(() => {
                                  setMessages((prev) => [
                                    ...prev,
                                    { role: 'assistant', content: 'Connection error. Please try again.' },
                                  ])
                                })
                                .finally(() => {
                                  setIsLoading(false)
                                  setInput('')
                                })
                            }, 50)
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all hover:shadow-sm"
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Chat messages */}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-gray max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all max-h-24"
                    style={{ minHeight: '42px' }}
                    disabled={isLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-shadow"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </motion.button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Powered by IKLAVYA AI
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating action button */}
      <motion.div
        className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
        animate={controls}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
        onClick={toggleChat}
      >
        <ChatOrb isOpen={isOpen} hasNewMessage={hasNewMessage} />
      </motion.div>
    </>
  )
}
