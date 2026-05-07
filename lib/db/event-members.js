import { query } from './client.js'
import {
  canEventRole,
  mapEventMemberRow,
  normalizeEventMemberRole,
} from '../event-permissions.js'

export async function getEventAccess(userId, eventId) {
  const result = await query(
    `select events.id as event_id,
            case
              when events.user_id = $1 then 'owner'
              else event_members.role
            end as role
     from events
     left join event_members
       on event_members.event_id = events.id
      and event_members.user_id = $1
     where events.id = $2
       and (events.user_id = $1 or event_members.user_id = $1)
     limit 1`,
    [userId, eventId]
  )

  if (!result.rows[0]) {
    return null
  }

  return {
    eventId: result.rows[0].event_id,
    role: normalizeEventMemberRole(result.rows[0].role),
  }
}

export async function requireEventPermission(userId, eventId, permission) {
  const access = await getEventAccess(userId, eventId)

  if (!access || !canEventRole(access.role, permission)) {
    return null
  }

  return access
}

export async function listEventMembers(userId, eventId) {
  const access = await requireEventPermission(userId, eventId, 'members:manage')

  if (!access) {
    return null
  }

  const result = await query(
    `with members as (
       select events.id as event_id,
              users.id as user_id,
              'owner' as role,
              events.created_at,
              users.email,
              users.name
       from events
       inner join users on users.id = events.user_id
       where events.id = $1
       union all
       select event_members.event_id,
              event_members.user_id,
              event_members.role,
              event_members.created_at,
              users.email,
              users.name
       from event_members
       inner join events on events.id = event_members.event_id
       inner join users on users.id = event_members.user_id
       where event_members.event_id = $1
         and event_members.user_id <> events.user_id
     )
     select event_id, user_id, role, created_at, email, name
     from members
     order by
       case role
         when 'owner' then 0
         when 'admin' then 1
         when 'editor' then 2
         else 3
       end,
       created_at asc`,
    [eventId]
  )

  return result.rows.map(mapEventMemberRow)
}

export async function upsertEventMember(userId, eventId, member) {
  const access = await requireEventPermission(userId, eventId, 'members:manage')

  if (!access) {
    return null
  }

  const role = normalizeEventMemberRole(member.role)

  if (role === 'owner') {
    throw new Error('不能通过成员管理设置所有者')
  }

  const result = await query(
    `with target_user as (
       select id, email, name
       from users
       where email = lower($2)
     ),
     upserted_member as (
       insert into event_members (event_id, user_id, role)
       select $1, target_user.id, $3
       from target_user
       where not exists (
         select 1
         from events
         where events.id = $1 and events.user_id = target_user.id
       )
       on conflict (event_id, user_id)
       do update set role = excluded.role,
                     updated_at = now()
       where event_members.role <> 'owner'
       returning event_id, user_id, role, created_at
     )
     select upserted_member.event_id,
            upserted_member.user_id,
            upserted_member.role,
            upserted_member.created_at,
            target_user.email,
            target_user.name
     from upserted_member
     inner join target_user on target_user.id = upserted_member.user_id`,
    [eventId, member.email, role]
  )

  return result.rows[0] ? mapEventMemberRow(result.rows[0]) : undefined
}

export async function removeEventMember(userId, eventId, memberUserId) {
  const access = await requireEventPermission(userId, eventId, 'members:manage')

  if (!access) {
    return null
  }

  const result = await query(
    `delete from event_members
     where event_id = $1
       and user_id = $2
       and role <> 'owner'
     returning user_id`,
    [eventId, memberUserId]
  )

  return result.rowCount > 0
}
