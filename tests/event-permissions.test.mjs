import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  EVENT_MEMBER_ROLES,
  canEventRole,
  mapEventMemberRow,
  normalizeEventMemberRole,
} from '../lib/event-permissions.js'
import { eventAccessCondition } from '../lib/db/event-access-sql.js'

test('normalizeEventMemberRole accepts known roles', () => {
  assert.equal(normalizeEventMemberRole('owner'), 'owner')
  assert.equal(normalizeEventMemberRole('admin'), 'admin')
  assert.equal(normalizeEventMemberRole('editor'), 'editor')
  assert.equal(normalizeEventMemberRole('viewer'), 'viewer')
})

test('normalizeEventMemberRole falls back to viewer', () => {
  assert.equal(normalizeEventMemberRole('invalid'), 'viewer')
  assert.equal(normalizeEventMemberRole(null), 'viewer')
})

test('canEventRole allows owner to do everything', () => {
  for (const permission of EVENT_MEMBER_ROLES.owner.permissions) {
    assert.equal(canEventRole('owner', permission), true)
  }
})

test('canEventRole separates editor and viewer permissions', () => {
  assert.equal(canEventRole('editor', 'records:update'), true)
  assert.equal(canEventRole('editor', 'members:manage'), false)
  assert.equal(canEventRole('viewer', 'records:view'), true)
  assert.equal(canEventRole('viewer', 'records:update'), false)
  assert.equal(canEventRole('viewer', 'amounts:view'), false)
})

test('mapEventMemberRow returns client member shape', () => {
  assert.deepEqual(
    mapEventMemberRow({
      event_id: 'event-1',
      user_id: 'user-1',
      role: 'admin',
      created_at: '2026-05-07T10:00:00.000Z',
      email: 'admin@example.com',
      name: '管理员',
    }),
    {
      eventId: 'event-1',
      userId: 'user-1',
      role: 'admin',
      email: 'admin@example.com',
      name: '管理员',
      createdAt: '2026-05-07T10:00:00.000Z',
    }
  )
})

test('eventAccessCondition contains role permissions from the shared config', () => {
  const condition = eventAccessCondition('$10', '$11')

  assert.match(condition, /events\.user_id = \$10/)
  assert.match(condition, /\$11 = any/)
  assert.match(condition, /when 'owner'/)
  assert.match(condition, /'event:delete'/)
  assert.match(condition, /when 'viewer'/)
  assert.match(condition, /'attachments:view'/)

  for (const permission of EVENT_MEMBER_ROLES.editor.permissions) {
    assert.match(condition, new RegExp(`'${permission}'`))
  }
})
