import { jsonError, optionalString, readJson } from '@/lib/api.js'
import { deleteAttachment, updateAttachment } from '@/lib/db/attachments.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function PATCH(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const { id } = await params
    const body = await readJson(request)
    const attachment = await updateAttachment(user.id, id, {
      displayName: optionalString(body.displayName),
      note: optionalString(body.note),
    })

    if (!attachment) {
      return jsonError('文件不存在', 404)
    }

    return Response.json({ attachment })
  } catch (error) {
    return jsonError(error.message)
  }
}

export async function DELETE(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const deleted = await deleteAttachment(user.id, id)

  if (!deleted) {
    return jsonError('文件不存在', 404)
  }

  return Response.json({ success: true })
}
