import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const res = await fetch(`${API_URL}/broadcast-quiz/${id}/rebroadcast`, {
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
