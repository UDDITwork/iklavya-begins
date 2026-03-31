import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { id } = await params

    const res = await fetch(`${API_URL}/resume-drafts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Not found' }, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { id } = await params
    const body = await request.json()

    const res = await fetch(`${API_URL}/resume-drafts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || 'Save failed' }, { status: res.status })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { id } = await params

    const res = await fetch(`${API_URL}/resume-drafts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const data = await res.json()
      return NextResponse.json({ error: data.detail || 'Delete failed' }, { status: res.status })
    }
    return new Response(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
