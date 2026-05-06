import { jsonError, optionalString, readJson, requireString } from '@/lib/api.js'
import {
  createEvent,
  createGiftRecord,
  listGiftBookData,
} from '@/lib/db/gifts.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function GET() {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const data = await listGiftBookData(user.id)

  return Response.json(data)
}

export async function POST(request) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const body = await readJson(request)

    if (body.kind === 'event') {
      const event = await createEvent(user.id, {
        name: requireString(body.name, '请输入活动名称'),
        type: requireString(body.type, '请选择活动类型'),
        date: requireString(body.date, '请选择活动日期'),
        location: optionalString(body.location),
        description: optionalString(body.description),
      })

      return Response.json({ event }, { status: 201 })
    }

    if (body.kind === 'record') {
      const amount = Number(body.amount)

      if (!Number.isFinite(amount) || amount < 0) {
        return jsonError('请输入有效金额')
      }

      const record = await createGiftRecord(user.id, {
        eventId: requireString(body.eventId, '请选择活动'),
        guestName: requireString(body.guestName, '请输入送礼人姓名'),
        amount,
        giftItem: optionalString(body.giftItem) ?? '',
        relativeTitle: optionalString(body.relativeTitle),
        date: requireString(body.date, '请选择日期'),
        note: optionalString(body.note),
      })

      if (!record) {
        return jsonError('活动不存在', 404)
      }

      return Response.json({ record }, { status: 201 })
    }

    return jsonError('未知的数据类型')
  } catch (error) {
    return jsonError(error.message)
  }
}
