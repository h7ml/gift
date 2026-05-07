import { jsonError } from '@/lib/api.js'
import {
  AttachmentStorageNotMigratedError,
  createAttachment,
  listAttachments,
} from '@/lib/db/attachments.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

const MAX_FILE_SIZE = 20 * 1024 * 1024

export async function GET(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const attachments = await listAttachments(user.id, id)

  return Response.json({ attachments })
}

export async function POST(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const formData = await request.formData()
  const files = formData.getAll('files')

  if (files.length === 0) {
    return jsonError('请选择要上传的文件')
  }

  try {
    const attachments = []

    for (const file of files) {
      if (!(file instanceof File)) {
        return jsonError('文件格式错误')
      }

      if (file.size > MAX_FILE_SIZE) {
        return jsonError(`文件 ${file.name} 超过 20MB`)
      }

      const attachment = await createAttachment(user.id, id, file)

      if (!attachment) {
        return jsonError('活动不存在', 404)
      }

      attachments.push(attachment)
    }

    return Response.json({ attachments }, { status: 201 })
  } catch (error) {
    if (error instanceof AttachmentStorageNotMigratedError) {
      return jsonError(error.message, 500)
    }

    return jsonError(error.message)
  }
}
