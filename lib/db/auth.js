import { randomBytes, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'

import { query } from './client.js'

const scrypt = promisify(scryptCallback)
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export const SESSION_COOKIE_NAME = 'gift_session'

function mapUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: toIsoString(row.created_at),
  }
}

function toIsoString(value) {
  return value instanceof Date ? value.toISOString() : value
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, 64)

  return `scrypt:${salt}:${Buffer.from(key).toString('hex')}`
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, keyHex] = storedHash.split(':')

  if (algorithm !== 'scrypt' || !salt || !keyHex) {
    return false
  }

  const storedKey = Buffer.from(keyHex, 'hex')
  const derivedKey = await scrypt(password, salt, storedKey.length)

  return timingSafeEqual(storedKey, Buffer.from(derivedKey))
}

export async function createUser({ email, password, name }) {
  const passwordHash = await hashPassword(password)
  const result = await query(
    `insert into users (email, password_hash, name)
     values ($1, $2, $3)
     returning id, email, name, created_at`,
    [email.toLowerCase(), passwordHash, name]
  )

  return mapUserRow(result.rows[0])
}

export async function findUserWithPasswordByEmail(email) {
  const result = await query(
    `select id, email, name, password_hash, created_at
     from users
     where email = $1`,
    [email.toLowerCase()]
  )

  return result.rows[0] ?? null
}

export async function findUserBySessionToken(token) {
  const result = await query(
    `select users.id, users.email, users.name, users.created_at
     from sessions
     inner join users on users.id = sessions.user_id
     where sessions.token = $1 and sessions.expires_at > now()`,
    [token]
  )

  return result.rows[0] ? mapUserRow(result.rows[0]) : null
}

export async function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  const result = await query(
    `insert into sessions (user_id, token, expires_at)
     values ($1, $2, now() + ($3 || ' seconds')::interval)
     returning token`,
    [userId, token, SESSION_MAX_AGE_SECONDS]
  )

  return result.rows[0].token
}

export async function deleteSession(token) {
  await query('delete from sessions where token = $1', [token])
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
