import { NextResponse } from 'next/server'
import { getMentorAuthCookie } from '@/lib/mentor-auth'

const API_URL = process.env.API_URL!

export async function GET() {
  try {
    const token = await getMentorAuthCookie()

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const res = await fetch(`${API_URL}/mentor/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({ mentor: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
