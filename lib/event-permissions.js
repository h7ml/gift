export const EVENT_MEMBER_ROLES = {
  owner: {
    label: '所有者',
    permissions: [
      'event:view',
      'event:update',
      'event:delete',
      'members:manage',
      'records:view',
      'records:create',
      'records:update',
      'records:delete',
      'records:import',
      'records:export',
      'attachments:view',
      'attachments:create',
      'attachments:update',
      'attachments:delete',
      'amounts:view',
    ],
  },
  admin: {
    label: '管理员',
    permissions: [
      'event:view',
      'event:update',
      'members:manage',
      'records:view',
      'records:create',
      'records:update',
      'records:delete',
      'records:import',
      'records:export',
      'attachments:view',
      'attachments:create',
      'attachments:update',
      'attachments:delete',
      'amounts:view',
    ],
  },
  editor: {
    label: '编辑者',
    permissions: [
      'event:view',
      'records:view',
      'records:create',
      'records:update',
      'records:import',
      'records:export',
      'attachments:view',
      'attachments:create',
      'attachments:update',
      'amounts:view',
    ],
  },
  viewer: {
    label: '查看者',
    permissions: ['event:view', 'records:view', 'attachments:view'],
  },
}

export function normalizeEventMemberRole(role) {
  return Object.hasOwn(EVENT_MEMBER_ROLES, role) ? role : 'viewer'
}

export function canEventRole(role, permission) {
  const normalizedRole = normalizeEventMemberRole(role)
  return EVENT_MEMBER_ROLES[normalizedRole].permissions.includes(permission)
}

export function mapEventMemberRow(row) {
  return {
    eventId: row.event_id,
    userId: row.user_id,
    role: normalizeEventMemberRole(row.role),
    email: row.email,
    name: row.name,
    createdAt: toIsoString(row.created_at),
  }
}

function toIsoString(value) {
  return value instanceof Date ? value.toISOString() : value
}
