import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL!

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/mentors/verified`)

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch mentors' },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
