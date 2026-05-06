import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME, deleteSession } from '@/lib/db/auth.js'
import { clearSessionCookie } from '@/lib/server-auth.js'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await deleteSession(token)
  }

  await clearSessionCookie()

  return Response.json({ success: true })
}
