export type EventMemberRole = 'owner' | 'admin' | 'editor' | 'viewer'

export type EventPermission =
  | 'event:view'
  | 'event:update'
  | 'event:delete'
  | 'members:manage'
  | 'records:view'
  | 'records:create'
  | 'records:update'
  | 'records:delete'
  | 'records:import'
  | 'records:export'
  | 'attachments:view'
  | 'attachments:create'
  | 'attachments:update'
  | 'attachments:delete'
  | 'amounts:view'

export interface EventMemberRoleConfig {
  label: string
  permissions: EventPermission[]
}

export interface EventMember {
  eventId: string
  userId: string
  role: EventMemberRole
  email: string
  name: string
  createdAt: string
}

export const EVENT_MEMBER_ROLES: Record<
  EventMemberRole,
  EventMemberRoleConfig
>

export function normalizeEventMemberRole(role: unknown): EventMemberRole

export function canEventRole(
  role: unknown,
  permission: EventPermission
): boolean

export function mapEventMemberRow(row: Record<string, unknown>): EventMember
