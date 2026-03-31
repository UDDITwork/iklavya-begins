import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const formData = await request.formData()

    const res = await fetch(`${API_URL}/resume-drafts/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Upload failed' }, { status: res.status })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
