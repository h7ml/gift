import { jsonError, readJson, requireString } from '@/lib/api.js'
import { listEventMembers, upsertEventMember } from '@/lib/db/event-members.js'
import { normalizeEventMemberRole } from '@/lib/event-permissions.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function GET(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const members = await listEventMembers(user.id, id)

  if (!members) {
    return jsonError('活动不存在', 404)
  }

  return Response.json({ members })
}

export async function POST(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const { id } = await params
    const body = await readJson(request)
    const role = normalizeEventMemberRole(requireString(body.role, '请选择角色'))

    if (role === 'owner') {
      return jsonError('不能通过成员管理设置所有者')
    }

    const member = await upsertEventMember(user.id, id, {
      email: requireString(body.email, '请输入成员邮箱'),
      role,
    })

    if (member === null) {
      return jsonError('活动不存在', 404)
    }

    if (member === undefined) {
      return jsonError('成员不存在或不能修改所有者', 404)
    }

    return Response.json({ member }, { status: 201 })
  } catch (error) {
    return jsonError(error.message)
  }
}
