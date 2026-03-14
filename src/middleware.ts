import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'iklavya-token'

const protectedPaths = ['/dashboard', '/admin', '/session', '/sessions', '/profile', '/resume-builder', '/resume-session', '/assessments']
const authPaths = ['/login', '/register']
// Public landing pages that should redirect to dashboard when authenticated
const landingPaths = ['/', '/students', '/institutions', '/for-employers']

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))
  const isLandingPage = landingPaths.includes(pathname)

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      await jwtVerify(token, secret)
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }
  }

  // Redirect authenticated users away from auth pages and landing pages
  if ((isAuthPage || isLandingPage) && token) {
    try {
      await jwtVerify(token, secret)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Token invalid, let them proceed
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/students', '/institutions', '/for-employers', '/dashboard/:path*', '/admin/:path*', '/session/:path*', '/sessions/:path*', '/profile/:path*', '/resume-builder/:path*', '/resume-session/:path*', '/login', '/register', '/career-guidance/:path*', '/assessments/:path*', '/cert/:path*'],
}
