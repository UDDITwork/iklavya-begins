import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

// In-memory applied jobs per user (MVP — replace with DB later)
const appliedJobsMap = new Map<string, Set<string>>()

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

    const userKey = token.slice(-16)

    if (!appliedJobsMap.has(userKey)) {
      appliedJobsMap.set(userKey, new Set())
    }

    appliedJobsMap.get(userKey)!.add(jobId)

    return NextResponse.json({
      applied: true,
      jobId,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
