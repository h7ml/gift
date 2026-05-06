import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { jsonError } from '@/lib/api.js'
import {
  ATTACHMENT_UPLOAD_DIR,
  findAttachmentForUser,
} from '@/lib/db/attachments.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function GET(_request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const attachment = await findAttachmentForUser(user.id, id)

  if (!attachment) {
    return jsonError('文件不存在', 404)
  }

  try {
    const file = await readFile(
      path.join(ATTACHMENT_UPLOAD_DIR, attachment.stored_name)
    )

    return new Response(file, {
      headers: {
        'Content-Type': attachment.mime_type,
        'Content-Disposition': `inline; filename="${encodeURIComponent(
          attachment.display_name || attachment.original_name
        )}"`,
      },
    })
  } catch {
    return jsonError('文件不存在', 404)
  }
}
