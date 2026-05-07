import { jsonError } from '@/lib/api.js'
import {
  AttachmentStorageNotMigratedError,
  buildAttachmentDownloadHeaders,
  findAttachmentFileForUser,
} from '@/lib/db/attachments.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function GET(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  let attachment

  try {
    attachment = await findAttachmentFileForUser(user.id, id)
  } catch (error) {
    if (error instanceof AttachmentStorageNotMigratedError) {
      return jsonError(error.message, 500)
    }

    return jsonError(error.message || '文件加载失败', 500)
  }

  if (!attachment?.file_data) {
    return jsonError('文件不存在', 404)
  }

  return new Response(attachment.file_data, {
    headers: buildAttachmentDownloadHeaders(attachment),
  })
}
