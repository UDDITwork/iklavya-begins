import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'iklavya-token'
const MENTOR_COOKIE_NAME = 'iklavya-mentor-token'

const protectedPaths = ['/dashboard', '/admin', '/session', '/sessions', '/profile', '/resume-builder', '/resume-session', '/assessments']
const authPaths = ['/login', '/register']
// Public landing pages that should redirect to dashboard when authenticated
const landingPaths = ['/', '/students', '/institutions', '/for-employers']
// Mentor auth pages (redirect to mentor dashboard if already logged in)
const mentorAuthPaths = ['/mentor/login', '/mentor/signup']
// Mentor protected pages (redirect to mentor login if not authenticated)
const mentorProtectedPaths = ['/mentor/dashboard']

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const mentorToken = request.cookies.get(MENTOR_COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))
  const isLandingPage = landingPaths.includes(pathname)
  const isMentorAuthPage = mentorAuthPaths.some((p) => pathname.startsWith(p))
  const isMentorProtected = mentorProtectedPaths.some((p) => pathname.startsWith(p))

  // Mentor protected routes — require mentor token
  if (isMentorProtected) {
    if (!mentorToken) {
      return NextResponse.redirect(new URL('/mentor/login', request.url))
    }
    try {
      await jwtVerify(mentorToken, secret)
    } catch {
      const response = NextResponse.redirect(new URL('/mentor/login', request.url))
      response.cookies.delete(MENTOR_COOKIE_NAME)
      return response
    }
  }

  // Redirect authenticated mentors away from mentor auth pages
  if (isMentorAuthPage && mentorToken) {
    try {
      await jwtVerify(mentorToken, secret)
      return NextResponse.redirect(new URL('/mentor/dashboard', request.url))
    } catch {
      // Token invalid, let them proceed
    }
  }

  // Student/user protected routes
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
  matcher: ['/', '/students', '/institutions', '/for-employers', '/dashboard/:path*', '/admin/:path*', '/session/:path*', '/sessions/:path*', '/profile/:path*', '/resume-builder/:path*', '/resume-session/:path*', '/login', '/register', '/career-guidance/:path*', '/assessments/:path*', '/cert/:path*', '/mentor/:path*'],
}
