import { NextResponse } from 'next/server'
import { setMentorAuthCookie } from '@/lib/mentor-auth'

const API_URL = process.env.API_URL!

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${API_URL}/mentor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Invalid credentials' },
        { status: res.status }
      )
    }

    await setMentorAuthCookie(data.token)

    return NextResponse.json({ mentor: data.mentor })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
