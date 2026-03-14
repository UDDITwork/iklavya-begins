import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL!

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const res = await fetch(`${API_URL}/certificates/public/${slug}`)

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch certificate' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
