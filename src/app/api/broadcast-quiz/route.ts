import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const res = await fetch(`${API_URL}/broadcast-quiz`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Failed' }, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json()
    const res = await fetch(`${API_URL}/broadcast-quiz`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Failed' }, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
