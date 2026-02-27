'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { playSend } from '@/lib/sounds'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingIndicator from '@/components/chat/TypingIndicator'
import ResumePreviewCard from '@/components/resume/ResumePreviewCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ResumeData {
  resume_id: string
  resume_json: string
  template: string
}

let msgCounter = 0

export default function ResumeSessionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('AI Resume Builder')
  const [sessionStatus, setSessionStatus] = useState('active')
  const [sessionTemplate, setSessionTemplate] = useState('professional')
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
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
  }, [messages, isStreaming])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function loadSession() {
    try {
      const res = await fetch(`/api/resume/sessions/${id}`)
      if (!res.ok) {
        toast.error('Resume session not found')
        router.push('/resume-builder')
        return
      }
      const data = await res.json()
      setSessionTitle(data.session.title)
      setSessionStatus(data.session.status)
      setSessionTemplate(data.session.template || 'professional')
      setMessages(
        data.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      )

      // Check if resume already exists for this session
      if (data.session.status === 'completed') {
        try {
          // Try fetching resumes to find one for this session
          const resumeListRes = await fetch('/api/resume/sessions')
          if (resumeListRes.ok) {
            const listData = await resumeListRes.json()
            const thisSession = listData.sessions?.find(
              (s: { id: string }) => s.id === id
            )
            if (thisSession) {
              // Session is completed, try to load the resume
              // We'll need to find the resume ID from the messages
              const lastAssistantMsg = data.messages
                .filter((m: { role: string }) => m.role === 'assistant')
                .pop()
              if (lastAssistantMsg) {
                const match = lastAssistantMsg.content.match(
                  /<resume_json>([\s\S]*?)<\/resume_json>/
                )
                if (match) {
                  // Resume JSON is in the message, we just need the resume ID
                  // For now, set a placeholder — the resume_ready event would have set it
                }
              }
            }
          }
        } catch { /* ignore */ }
      }
    } catch {
      toast.error('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

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
        } else if (eventType === 'resume_ready') {
          setResumeData({
            resume_id: data.resume_id,
            resume_json: data.resume_json,
            template: sessionTemplate,
          })
          setSessionStatus('completed')
        } else if (eventType === 'error') {
          toast.error(data.error || 'An error occurred')
        }
      } catch { /* skip malformed JSON */ }
    },
    [sessionTemplate]
  )

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming || sessionStatus !== 'active') return

    playSend()
    setInput('')
    const userMsg: Message = {
      id: `user-${++msgCounter}`,
      role: 'user',
      content: text,
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
      const res = await fetch(`/api/resume/sessions/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
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
        // User navigated away
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

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/resume-builder')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">{sessionTitle}</h1>
            <span
              className={`text-[10px] font-medium ${
                sessionStatus === 'active' ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {sessionStatus === 'active' ? 'Building Resume' : 'Resume Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-2">Start building your resume</p>
            <p className="text-gray-300 text-xs">
              Tell the AI about yourself — it will ask questions one by one to build your resume
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <TypingIndicator />
        )}

        {resumeData && (
          <ResumePreviewCard
            resumeId={resumeData.resume_id}
            resumeJson={resumeData.resume_json}
            template={resumeData.template}
            onTemplateChange={(t) =>
              setResumeData((prev) => (prev ? { ...prev, template: t } : null))
            }
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {sessionStatus === 'active' && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all duration-200 text-sm disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
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
        </div>
      )}
    </div>
  )
}
