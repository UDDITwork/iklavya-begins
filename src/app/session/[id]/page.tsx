'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2, StopCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { playSend } from '@/lib/sounds'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingIndicator from '@/components/chat/TypingIndicator'
import AnalysisCard from '@/components/chat/AnalysisCard'
import AnswerBubbles from '@/components/chat/AnswerBubbles'
import SessionProgress from '@/components/chat/SessionProgress'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AnalysisData {
  analysis_json?: string
  analysis_markdown?: string
  roadmap_json?: string
}

interface ProgressData {
  percent: number
  remaining_estimate: number | null
  status: 'on_track' | 'direction_changed' | 'deepening' | 'ready'
}

let msgCounter = 0

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('Career Guidance')
  const [sessionStatus, setSessionStatus] = useState('active')
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [progress, setProgress] = useState<ProgressData>({
    percent: 0,
    remaining_estimate: null,
    status: 'on_track',
  })
  const [showCustomInput, setShowCustomInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    loadSession()
    return () => {
      abortRef.current?.abort()
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming, currentOptions])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadSession() {
    try {
      const res = await fetch(`/api/sessions/${id}`)
      if (!res.ok) {
        toast.error('Session not found')
        router.push('/dashboard')
        return
      }
      const data = await res.json()
      setSessionTitle(data.session.title)
      setSessionStatus(data.session.status)
      setMessages(
        data.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      )

      if (data.session.analysis_generated === 1) {
        try {
          const analysisRes = await fetch(`/api/sessions/${id}/analysis`)
          if (analysisRes.ok) {
            const analysisData = await analysisRes.json()
            setAnalysis({
              analysis_json: analysisData.analysis_json,
              analysis_markdown: analysisData.analysis_markdown,
              roadmap_json: analysisData.roadmap_json,
            })
            // Session already done — show full progress
            setProgress({ percent: 100, remaining_estimate: 0, status: 'ready' })
          }
        } catch { /* ignore */ }
      }
    } catch {
      toast.error('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const fireConfetti = useCallback(async () => {
    try {
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#166534', '#4ade80', '#86efac', '#ffffff', '#fbbf24'],
      })
    } catch { /* silent fail if canvas-confetti unavailable */ }
  }, [])

  const handleSSEEvent = useCallback(
    (eventType: string, dataStr: string, assistantId: string) => {
      try {
        const data = JSON.parse(dataStr)

        if (eventType === 'message') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + data.text }
                : m
            )
          )
        } else if (eventType === 'options') {
          // Only show options when not streaming (full message received)
          if (Array.isArray(data.options) && data.options.length > 0) {
            setCurrentOptions(data.options)
            setShowCustomInput(false)
          }
        } else if (eventType === 'progress') {
          const pct = typeof data.percent === 'number'
            ? Math.max(0, Math.min(100, data.percent))
            : null
          if (pct !== null) {
            setProgress({
              percent: pct,
              remaining_estimate: data.remaining_estimate ?? null,
              status: data.status ?? 'on_track',
            })
          }
        } else if (eventType === 'analysis') {
          setAnalysis({
            analysis_json: data.analysis_json,
            analysis_markdown: data.analysis_markdown,
            roadmap_json: data.roadmap_json,
          })
          setSessionStatus('completed')
          setProgress({ percent: 100, remaining_estimate: 0, status: 'ready' })
          fireConfetti()
        } else if (eventType === 'error') {
          toast.error(data.error || 'An error occurred')
        }
      } catch { /* skip malformed JSON */ }
    },
    [fireConfetti]
  )

  async function sendMessage(text?: string) {
    const msgText = (text ?? input).trim()
    if (!msgText || isStreaming || sessionStatus !== 'active') return

    playSend()
    setInput('')
    setCurrentOptions([])
    setShowCustomInput(false)

    const userMsg: Message = {
      id: `user-${++msgCounter}`,
      role: 'user',
      content: msgText,
    }
    const assistantId = `assistant-${++msgCounter}`

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/sessions/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msgText }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json()
        toast.error(errData.error || errData.detail || 'Failed to send message')
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setIsStreaming(false)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let currentEventType = 'message'

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() || ''

        for (const block of blocks) {
          if (!block.trim()) continue

          let eventType = currentEventType
          let dataStr = ''

          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6)
            }
          }

          if (dataStr) {
            handleSSEEvent(eventType, dataStr, assistantId)
          }

          currentEventType = 'message'
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User navigated away — not an error
      } else {
        toast.error('Connection lost. Please try again.')
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      }
    } finally {
      abortRef.current = null
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  async function handleEndSession() {
    setEnding(true)
    try {
      const res = await fetch(`/api/sessions/${id}/end`, { method: 'POST' })
      if (res.ok) {
        setSessionStatus('completed')
        toast.success('Session ended')
      } else {
        const data = await res.json()
        toast.error(data.error || data.detail || 'Failed to end session')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setEnding(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  const showBubbles = currentOptions.length > 0 && !isStreaming && sessionStatus === 'active'
  const showTextInput = sessionStatus === 'active' && (!showBubbles || showCustomInput)

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">{sessionTitle}</h1>
            <span className={`text-[10px] font-medium ${sessionStatus === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
              {sessionStatus === 'active' ? 'Active' : 'Completed'}
            </span>
          </div>
        </div>

        {sessionStatus === 'active' && (
          <button
            onClick={handleEndSession}
            disabled={ending || isStreaming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {ending ? <Loader2 size={12} className="animate-spin" /> : <StopCircle size={12} />}
            End Session
          </button>
        )}
      </div>

      {/* Progress bar — only shown during active sessions */}
      {sessionStatus === 'active' && (
        <SessionProgress
          percent={progress.percent}
          remainingEstimate={progress.remaining_estimate}
          status={progress.status}
        />
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-2">Start the conversation</p>
            <p className="text-gray-300 text-xs">Tell the AI about yourself to begin your career guidance session</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {/* Answer bubbles — shown after AI question, before user replies */}
        {showBubbles && (
          <AnswerBubbles
            options={currentOptions}
            onSelect={(option) => sendMessage(option)}
            onCustom={() => {
              setShowCustomInput(true)
              setTimeout(() => inputRef.current?.focus(), 50)
            }}
            disabled={isStreaming}
          />
        )}

        {analysis && (
          <AnalysisCard
            sessionId={id}
            analysisMarkdown={analysis.analysis_markdown}
            analysisJson={analysis.analysis_json}
            roadmapJson={analysis.roadmap_json}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {sessionStatus === 'active' && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto">
            {/* When bubbles are shown and custom input not yet opened */}
            {showBubbles && !showCustomInput && (
              <p className="text-xs text-gray-400 text-center mb-2">
                Choose an answer above or{' '}
                <button
                  onClick={() => {
                    setShowCustomInput(true)
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}
                  className="text-green-700 hover:underline font-medium"
                >
                  type your own
                </button>
              </p>
            )}

            {/* Text input — always shown when no bubbles, or when "type your own" clicked */}
            {showTextInput && (
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={showCustomInput ? 'Type your own answer...' : 'Type your message...'}
                  disabled={isStreaming}
                  className="flex-1 px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className="w-11 h-11 rounded-lg bg-green-800 text-white flex items-center justify-center hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isStreaming ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
