import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST() {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const res = await fetch(`${API_URL}/broadcast-quiz/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Failed' }, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
