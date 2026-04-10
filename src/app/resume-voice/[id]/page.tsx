'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, PhoneOff, ArrowLeft, Send, Clock,
  Volume2, VolumeX, MessageSquare, AlertTriangle, FileText,
  Download, PenLine, CheckCircle2, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useVoicePipeline } from '@/app/(features)/dashboard/ai-interview/hooks/useVoicePipeline'
import { useTTSPlayer } from '@/app/(features)/dashboard/ai-interview/hooks/useTTSPlayer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

let msgCounter = 0

function stripTags(text: string): string {
  return text
    .replace(/<resume_json>[\s\S]*?<\/resume_json>/g, '')
    .replace(/<progress>[\s\S]*?<\/progress>/g, '')
    .replace(/<options>[\s\S]*?<\/options>/g, '')
    .trim()
}

export default function VoiceResumePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [waitingForAI, setWaitingForAI] = useState(false)
  const [sessionStatus, setSessionStatus] = useState('active')
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [textInput, setTextInput] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(true)

  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitRef = useRef<(text?: string) => void>(() => {})
  const abortRef = useRef<AbortController | null>(null)

  const { speak, isSpeaking, stop: stopTTS } = useTTSPlayer()

  const handleSilence = useCallback(() => {
    submitRef.current?.()
  }, [])

  const {
    startListening, stopListening, interimTranscript, finalTranscript,
    isListening, isSupported, resetTranscript,
  } = useVoicePipeline({ onSilence: handleSilence, silenceTimeout: 5000 })

  // Timer
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => setElapsed(p => p + 1), 1000)
    return () => { if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current) }
  }, [])

  // Scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, interimTranscript])

  // Load session
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/resume/sessions/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.session?.status === 'completed') {
            setSessionStatus('completed')
            toast('This session is already completed.')
            router.push('/dashboard/resume-builder')
            return
          }
          if (data.messages?.length > 0) {
            setMessages(data.messages.map((m: { id: string; role: string; content: string }) => ({
              id: m.id, role: m.role as 'user' | 'assistant', content: m.content,
            })))
            setQuestionCount(data.messages.filter((m: { role: string }) => m.role === 'assistant').length)
          }
        }
      } catch { /* continue */ }
      finally { setLoading(false) }
    }
    load()
  }, [id, router])

  // SSE parser for resume endpoints
  const parseResumeSSE = useCallback(
    async (response: Response, callbacks: {
      onText?: (text: string) => void
      onResumeReady?: (resumeId: string) => void
      onError?: (error: string) => void
    }) => {
      const reader = response.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() || ''

        for (const block of blocks) {
          if (!block.trim()) continue
          let eventType = 'message'
          let dataStr = ''
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim()
            else if (line.startsWith('data: ')) dataStr = line.slice(6)
          }
          if (!dataStr) continue
          try {
            const data = JSON.parse(dataStr)
            if (eventType === 'message') callbacks.onText?.(data.text || '')
            else if (eventType === 'resume_ready') callbacks.onResumeReady?.(data.resume_id)
            else if (eventType === 'error') callbacks.onError?.(data.error || 'Unknown error')
          } catch { /* skip */ }
        }
      }
    }, []
  )

  // Send message and handle AI response
  const sendAndSpeak = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing || sessionStatus !== 'active') return
      setIsProcessing(true)
      stopListening()

      // Add user message
      const userMsgId = `user-${++msgCounter}`
      setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text }])
      setWaitingForAI(true)
      setCurrentQuestion('')

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/resume/sessions/${id}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
          signal: controller.signal,
        })

        if (!res.ok) {
          toast.error('Failed to send message')
          setIsProcessing(false)
          setWaitingForAI(false)
          return
        }

        let aiText = ''
        let gotResumeReady = false
        let readyResumeId = ''

        await parseResumeSSE(res, {
          onText: (chunk) => { aiText += chunk },
          onResumeReady: (rid) => { gotResumeReady = true; readyResumeId = rid },
          onError: (err) => { toast.error(err) },
        })

        const cleanText = stripTags(aiText)

        // Add AI message to transcript
        if (cleanText) {
          setMessages(prev => [...prev, { id: `assistant-${++msgCounter}`, role: 'assistant', content: cleanText }])
          setQuestionCount(prev => prev + 1)
        }

        setWaitingForAI(false)

        if (gotResumeReady) {
          setResumeId(readyResumeId)
          setSessionStatus('completed')
          stopListening()
          // Speak closing message, then show resume on this page
          if (cleanText && !audioMuted) await speak(cleanText)
          return
        }

        // Speak AI's question
        if (cleanText && !audioMuted) {
          setCurrentQuestion(cleanText)
          await speak(cleanText)
        } else if (cleanText) {
          setCurrentQuestion(cleanText)
        }

        // Start listening after TTS finishes
        if (isSupported) { resetTranscript(); startListening() }

      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          toast.error('Something went wrong')
        }
      } finally {
        setIsProcessing(false)
        abortRef.current = null
      }
    },
    [id, isProcessing, sessionStatus, stopListening, parseResumeSSE, speak, audioMuted, isSupported, resetTranscript, startListening]
  )

  // Wire up silence handler
  useEffect(() => {
    submitRef.current = () => {
      const text = (finalTranscript + ' ' + interimTranscript).trim()
      if (text) sendAndSpeak(text)
    }
  }, [finalTranscript, interimTranscript, sendAndSpeak])

  // Start session — send initial greeting
  useEffect(() => {
    if (started || loading) return
    setStarted(true)
    sendAndSpeak('Hi, I want to build my resume. Please guide me through the process.')
  }, [started, loading, sendAndSpeak])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      stopTTS()
      stopListening()
    }
  }, [stopTTS, stopListening])

  function handleSubmit() {
    const voiceText = (finalTranscript + ' ' + interimTranscript).trim()
    const text = voiceText || textInput.trim()
    if (text) { setTextInput(''); resetTranscript(); sendAndSpeak(text) }
    else toast.error('Please say or type something first')
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (textInput.trim()) { sendAndSpeak(textInput.trim()); setTextInput('') }
  }

  function handleMicToggle() {
    if (isListening) stopListening(); else startListening()
  }

  function handleEnd() {
    stopListening(); stopTTS()
    abortRef.current?.abort()
    router.push('/dashboard/resume-builder')
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  // Download PDF handler
  async function handleDownloadPDF() {
    if (!resumeId) return
    try {
      const res = await fetch(`/api/resume/${resumeId}/download`)
      if (!res.ok) { toast.error('Download failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'resume.pdf'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Download failed') }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ═══ RESUME COMPLETED SCREEN — Premium Glassmorphism ═══
  if (sessionStatus === 'completed' && resumeId) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8fa]">
        {/* Ambient gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)', top: '-10%', left: '-5%' }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)', bottom: '-15%', right: '-10%' }}
            animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', top: '40%', right: '20%' }}
            animate={{ x: [0, 15, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Decorative vector elements — scattered around */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top-left geometric */}
          <svg className="absolute top-8 left-8 opacity-[0.06]" width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="55" stroke="#166534" strokeWidth="1"/>
            <circle cx="60" cy="60" r="40" stroke="#166534" strokeWidth="0.5"/>
            <circle cx="60" cy="60" r="25" stroke="#166534" strokeWidth="0.5"/>
            <line x1="5" y1="60" x2="115" y2="60" stroke="#166534" strokeWidth="0.3"/>
            <line x1="60" y1="5" x2="60" y2="115" stroke="#166534" strokeWidth="0.3"/>
          </svg>

          {/* Top-right document icon */}
          <svg className="absolute top-12 right-16 opacity-[0.05]" width="80" height="100" viewBox="0 0 80 100" fill="none" stroke="#166534" strokeWidth="1.2">
            <rect x="5" y="5" width="55" height="70" rx="4"/>
            <path d="M60 5v20h15" /><line x1="15" y1="25" x2="50" y2="25"/><line x1="15" y1="35" x2="45" y2="35"/><line x1="15" y1="45" x2="50" y2="45"/><line x1="15" y1="55" x2="35" y2="55"/>
          </svg>

          {/* Bottom-left briefcase */}
          <svg className="absolute bottom-16 left-12 opacity-[0.05]" width="90" height="80" viewBox="0 0 90 80" fill="none" stroke="#166534" strokeWidth="1">
            <rect x="10" y="22" width="70" height="48" rx="6"/><path d="M30 22V14a6 6 0 016-6h18a6 6 0 016 6v8"/><line x1="10" y1="38" x2="80" y2="38"/>
          </svg>

          {/* Bottom-right star */}
          <svg className="absolute bottom-20 right-24 opacity-[0.05]" width="70" height="70" viewBox="0 0 70 70" fill="none" stroke="#166534" strokeWidth="1">
            <path d="M35 5l8 20h22l-17 14 6 21-19-12-19 12 6-21L5 25h22z"/>
          </svg>

          {/* Center-left pen */}
          <svg className="absolute top-1/2 left-6 -translate-y-1/2 opacity-[0.04]" width="40" height="120" viewBox="0 0 40 120" fill="none" stroke="#166534" strokeWidth="1">
            <rect x="10" y="10" width="20" height="80" rx="3"/><path d="M10 90l10 20 10-20"/><line x1="10" y1="25" x2="30" y2="25"/>
          </svg>
        </div>

        {/* Main Content — centered glass card */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg"
          >
            {/* Glass card */}
            <div
              className="relative rounded-2xl border border-white/40 p-8 sm:p-10 text-center overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(24px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              {/* Subtle inner glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />

              {/* Success checkmark with rings */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border border-green-200"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-green-300"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-green-600 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}
                >
                  <CheckCircle2 size={24} className="text-white" />
                </motion.div>
              </div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Your Resume is Ready
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto"
              >
                Built from your voice interview — reviewed, structured, and formatted for ATS compatibility.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center justify-center gap-6 mb-8"
              >
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{timeStr}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Duration</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{questionCount}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Exchanges</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-green-700">Ready</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Status</p>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-900 transition-all shadow-lg shadow-green-800/20 hover:shadow-green-800/30"
                >
                  <Download size={16} />
                  Download PDF Resume
                </button>

                <button
                  onClick={() => router.push(`/resume-editor/${resumeId}`)}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
                >
                  <PenLine size={16} />
                  Edit in Resume Editor
                </button>
              </motion.div>

              {/* Back link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <button
                  onClick={() => router.push('/dashboard/resume-builder')}
                  className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Back to Resume Builder
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Top Bar */}
      <div className="shrink-0 bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleEnd} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <FileText size={16} className="text-green-500" />
          <span className="text-sm font-medium text-white">Voice Resume Builder</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> {timeStr}
          </span>
          <span className="text-xs text-gray-500">Q{questionCount} of ~10</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center — AI Globe + Question */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* AI Globe — simplified pulsing orb */}
          <div className="relative w-32 h-32 mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-green-800/30"
              animate={isSpeaking
                ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }
                : { scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }
              }
              transition={{ duration: isSpeaking ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center"
              style={{ boxShadow: isSpeaking ? '0 0 40px rgba(34,197,94,0.4)' : '0 0 15px rgba(34,197,94,0.15)' }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-green-400"
                animate={isSpeaking
                  ? { scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }
                  : { scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }
                }
                transition={{ duration: isSpeaking ? 0.8 : 3, repeat: Infinity }}
              />
            </div>
            {/* Pulse rings when speaking */}
            {isSpeaking && (
              <>
                <motion.div className="absolute inset-0 rounded-full border border-green-400/20"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.div className="absolute inset-0 rounded-full border border-green-400/10"
                  animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
              </>
            )}
          </div>

          <p className="text-sm text-green-300/60 mb-4">IKLAVYA Resume Assistant</p>

          {/* Initial connecting state */}
          {waitingForAI && questionCount === 0 && !isSpeaking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Connecting to AI assistant...</span>
              </div>
              <p className="text-[11px] text-gray-600">This may take a few seconds</p>
            </motion.div>
          )}

          {/* Waveform when speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-[3px] mb-4">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <motion.div key={i} className="w-[3px] bg-green-400 rounded-full"
                  animate={{ height: ['4px', `${12 + Math.random() * 12}px`, '4px'] }}
                  transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.08 }} />
              ))}
            </div>
          )}

          {/* Question text — shown AFTER AI finishes speaking */}
          <AnimatePresence mode="wait">
            {waitingForAI && !isSpeaking && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-gray-500">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
                <span className="text-xs">Thinking...</span>
              </motion.div>
            )}
            {!isSpeaking && !waitingForAI && currentQuestion && (
              <motion.div key="question" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-5 py-3 max-w-lg text-center">
                <p className="text-sm text-gray-200 leading-relaxed">{currentQuestion}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live transcript overlay while user speaks */}
          {isListening && (finalTranscript || interimTranscript) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 bg-gray-800/30 rounded-lg px-4 py-2 max-w-lg">
              <p className="text-[10px] text-gray-500 mb-1">You&apos;re saying:</p>
              <p className="text-xs text-gray-300">
                {finalTranscript}
                {interimTranscript && <span className="text-gray-500"> {interimTranscript}</span>}
              </p>
            </motion.div>
          )}
        </div>

        {/* Transcript Sidebar */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <span className="text-sm font-semibold text-white">Conversation</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id}>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-0.5 ${
                      msg.role === 'assistant' ? 'text-green-500' : 'text-blue-400'
                    }`}>
                      {msg.role === 'assistant' ? 'AI' : 'You'}
                    </span>
                    <p className={`text-xs leading-relaxed ${msg.role === 'assistant' ? 'text-gray-300' : 'text-gray-400'}`}>
                      {msg.content}
                    </p>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setAudioMuted(!audioMuted)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${audioMuted ? 'bg-gray-700 text-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {isSupported ? (
            <button onClick={handleMicToggle} disabled={isSpeaking || isProcessing}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                isListening ? 'bg-white text-gray-900 ring-2 ring-white/30' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}>
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs bg-amber-500/10 px-3 py-2 rounded-full">
              <AlertTriangle size={12} /> No mic — use text
            </div>
          )}

          <button onClick={handleSubmit} disabled={isSpeaking || isProcessing || waitingForAI}
            className="h-11 px-5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40 flex items-center gap-2">
            <Send size={14} /> Next
          </button>

          <button onClick={() => setShowTranscript(!showTranscript)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              showTranscript ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}>
            <MessageSquare size={18} />
          </button>

          <button onClick={handleEnd}
            className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors">
            <PhoneOff size={18} />
          </button>
        </div>

        {/* Text fallback */}
        {!isSupported && (
          <form onSubmit={handleTextSubmit} className="flex gap-2 mt-3 max-w-lg mx-auto">
            <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Type your answer..." disabled={isSpeaking || isProcessing || waitingForAI}
              className="flex-1 px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500 disabled:opacity-40" />
            <button type="submit" disabled={!textInput.trim() || isSpeaking || isProcessing}
              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
