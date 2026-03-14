import { cookies } from 'next/headers'

export const MENTOR_COOKIE = 'iklavya-mentor-token'

export async function setMentorAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(MENTOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function getMentorAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(MENTOR_COOKIE)?.value
}

export async function removeMentorAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(MENTOR_COOKIE)
}
