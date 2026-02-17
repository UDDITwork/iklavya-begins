'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'

  // Strip analysis tags from displayed content
  const displayContent = content
    .replace(/<analysis_json>[\s\S]*?<\/analysis_json>/g, '')
    .replace(/<analysis_markdown>[\s\S]*?<\/analysis_markdown>/g, '')
    .replace(/<roadmap_json>[\s\S]*?<\/roadmap_json>/g, '')
    .trim()

  if (!displayContent) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-white border-2 border-green-800 text-gray-900'
            : 'bg-gray-50 border border-gray-200 text-gray-700'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
