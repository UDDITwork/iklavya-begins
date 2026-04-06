import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL!

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/interview/health`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'unreachable', error: 'Cannot connect to backend' },
      { status: 502 }
    )
  }
}
