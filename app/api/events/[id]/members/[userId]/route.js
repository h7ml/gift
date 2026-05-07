import { jsonError } from '@/lib/api.js'
import { removeEventMember } from '@/lib/db/event-members.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function DELETE(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id, userId } = await params
  const deleted = await removeEventMember(user.id, id, userId)

  if (deleted === null) {
    return jsonError('活动不存在', 404)
  }

  if (!deleted) {
    return jsonError('成员不存在或不能移除所有者', 404)
  }

  return Response.json({ success: true })
}
