import assert from 'node:assert/strict'
import { test } from 'node:test'

import { hashPassword, verifyPassword } from '../lib/db/auth.js'

test('hashPassword creates a non-plain-text hash that verifyPassword accepts', async () => {
  const password = 'secret-123456'

  const hash = await hashPassword(password)

  assert.notEqual(hash, password)
  assert.match(hash, /^scrypt:[a-f0-9]+:[a-f0-9]+$/)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('wrong-password', hash), false)
})
