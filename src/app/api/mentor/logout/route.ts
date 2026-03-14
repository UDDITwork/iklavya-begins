import { NextResponse } from 'next/server'
import { removeMentorAuthCookie } from '@/lib/mentor-auth'

export async function POST() {
  await removeMentorAuthCookie()
  return NextResponse.json({ success: true })
}
