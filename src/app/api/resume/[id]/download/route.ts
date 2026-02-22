import { getAuthCookie } from '@/lib/auth'

const API_URL = process.env.API_URL!

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { id } = await params

    const res = await fetch(`${API_URL}/resume/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const errorData = await res.json()
      return new Response(
        JSON.stringify({ error: errorData.detail || 'Download failed' }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Pipe PDF binary through
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': res.headers.get('Content-Disposition') || `attachment; filename="resume.pdf"`,
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
