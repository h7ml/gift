import { cookies } from 'next/headers'

import {
  SESSION_COOKIE_NAME,
  findUserBySessionToken,
  getSessionCookieOptions,
} from './db/auth.js'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return findUserBySessionToken(token)
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return user
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
}
