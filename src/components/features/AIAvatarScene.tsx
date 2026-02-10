'use client'

import { Bot } from 'lucide-react'

interface AIAvatarSceneProps {
  speaking?: boolean
}

export default function AIAvatarScene({ speaking = false }: AIAvatarSceneProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-xl">
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
          speaking ? 'ring-4 ring-blue-200' : ''
        }`}>
          <Bot size={36} className="text-blue-800" />
        </div>
        <p className="text-xs text-gray-500 font-medium">
          {speaking ? 'Speaking...' : 'AI Interviewer'}
        </p>
      </div>
    </div>
  )
}
