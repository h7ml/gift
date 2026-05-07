import { jsonError, optionalString, readJson, requireString } from '@/lib/api.js'
import { deleteEvent, updateEvent } from '@/lib/db/gifts.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function PUT(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const { id } = await params
    const body = await readJson(request)
    const event = await updateEvent(user.id, id, {
      name: requireString(body.name, '请输入活动名称'),
      type: requireString(body.type, '请选择活动类型'),
      date: requireString(body.date, '请选择活动日期'),
      bookkeeperName: requireString(body.bookkeeperName, '请输入记账人'),
      location: optionalString(body.location),
      description: optionalString(body.description),
      interfaceStyle: body.interfaceStyle === 'gray' ? 'gray' : 'red',
      pdfCoverImageDataUrl: optionalString(body.pdfCoverImageDataUrl),
    })

    if (!event) {
      return jsonError('活动不存在', 404)
    }

    return Response.json({ event })
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
  const deleted = await deleteEvent(user.id, id)

  if (!deleted) {
    return jsonError('活动不存在', 404)
  }

  return Response.json({ success: true })
}
