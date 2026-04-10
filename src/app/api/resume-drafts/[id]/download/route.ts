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

    const res = await fetch(`${API_URL}/resume-drafts/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      let errorMsg = 'Download failed'
      try {
        const errorData = await res.json()
        errorMsg = errorData.detail || errorMsg
      } catch {
        // Backend returned non-JSON error (HTML page, plain text, etc.)
        const text = await res.text().catch(() => '')
        errorMsg = `PDF generation failed (status ${res.status})`
        console.error('[resume-download] Backend error:', res.status, text.slice(0, 500))
      }
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify we actually got a PDF back, not an error page
    const contentType = res.headers.get('Content-Type') || ''
    if (!contentType.includes('pdf')) {
      const body = await res.text().catch(() => '')
      console.error('[resume-download] Expected PDF but got:', contentType, body.slice(0, 500))
      return new Response(
        JSON.stringify({ error: 'PDF generation failed — server returned unexpected response' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': res.headers.get('Content-Disposition') || 'attachment; filename="resume.pdf"',
      },
    })
  } catch (err) {
    console.error('[resume-download] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
