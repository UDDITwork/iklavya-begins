import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    const res = await fetch(`${API_URL}/resume/${id}/ats-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to compute ATS score' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
