import { jsonError, optionalString, readJson, requireString } from '@/lib/api.js'
import { deleteGiftRecord, updateGiftRecord } from '@/lib/db/gifts.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function PUT(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const { id } = await params
    const body = await readJson(request)
    const amount = Number(body.amount)

    if (!Number.isFinite(amount) || amount < 0) {
      return jsonError('请输入有效金额')
    }

    const record = await updateGiftRecord(user.id, id, {
      guestName: requireString(body.guestName, '请输入送礼人姓名'),
      amount,
      giftItem: optionalString(body.giftItem) ?? '',
      relativeTitle: optionalString(body.relativeTitle),
      date: requireString(body.date, '请选择日期'),
      note: optionalString(body.note),
    })

    if (!record) {
      return jsonError('记录不存在', 404)
    }

    return Response.json({ record })
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
  const deleted = await deleteGiftRecord(user.id, id)

  if (!deleted) {
    return jsonError('记录不存在', 404)
  }

  return Response.json({ success: true })
}
