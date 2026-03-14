import { NextResponse } from 'next/server'
import { getMentorAuthCookie } from '@/lib/mentor-auth'

const API_URL = process.env.API_URL!

export async function PATCH(request: Request) {
  try {
    const token = await getMentorAuthCookie()

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const res = await fetch(`${API_URL}/mentor/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to update profile' },
        { status: res.status }
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
