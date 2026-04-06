import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function POST(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()

    const res = await fetch(`${API_URL}/interview/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return new Response(
        JSON.stringify({ error: errorData.detail || 'TTS generation failed' }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(res.body, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
