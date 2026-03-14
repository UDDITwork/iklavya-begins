import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

// In-memory saved jobs per user (MVP — replace with DB later)
const savedJobsMap = new Map<string, Set<string>>()

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { jobId } = await request.json()
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 })
    }

    // Use token hash as user key
    const userKey = token.slice(-16)

    if (!savedJobsMap.has(userKey)) {
      savedJobsMap.set(userKey, new Set())
    }

    const userSaved = savedJobsMap.get(userKey)!
    const wasSaved = userSaved.has(jobId)

    if (wasSaved) {
      userSaved.delete(jobId)
    } else {
      userSaved.add(jobId)
    }

    return NextResponse.json({
      saved: !wasSaved,
      jobId,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
