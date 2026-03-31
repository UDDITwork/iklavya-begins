'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'

  // Strip all metadata tags from displayed content (belt-and-suspenders safety)
  const displayContent = content
    .replace(/<options>[\s\S]*?<\/options>/g, '')
    .replace(/<progress>[\s\S]*?<\/progress>/g, '')
    .replace(/<analysis_json>[\s\S]*?<\/analysis_json>/g, '')
    .replace(/<analysis_markdown>[\s\S]*?<\/analysis_markdown>/g, '')
    .replace(/<roadmap_json>[\s\S]*?<\/roadmap_json>/g, '')
    .replace(/<resume_json>[\s\S]*?<\/resume_json>/g, '')
    .trim()

  if (!displayContent) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-green-800 flex items-center justify-center shrink-0 mb-0.5">
          <span className="text-white text-[10px] font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-green-800 text-white rounded-2xl rounded-br-sm px-4 py-3'
            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3'
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
