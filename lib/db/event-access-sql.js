import { EVENT_MEMBER_ROLES } from '../event-permissions.js'

function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

const ROLE_PERMISSION_CASE = Object.entries(EVENT_MEMBER_ROLES)
  .map(
    ([role, config]) =>
      `when ${sqlText(role)} then array[${config.permissions
        .map(sqlText)
        .join(', ')}]::text[]`
  )
  .join('\n                  ')

export function eventAccessCondition(userIdParam = '$1', permissionParam = '$2') {
  return `(events.user_id = ${userIdParam}
          or exists (
            select 1
            from event_members
            where event_members.event_id = events.id
              and event_members.user_id = ${userIdParam}
              and ${permissionParam} = any (
                case event_members.role
                  ${ROLE_PERMISSION_CASE}
                  else array[]::text[]
                end
              )
          ))`
}
