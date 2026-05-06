import { jsonError, readJson } from '@/lib/api.js'
import {
  listUserPreferences,
  updateGiftRecordColumnsPreference,
} from '@/lib/db/preferences.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

export async function GET() {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const preferences = await listUserPreferences(user.id)

  return Response.json({ preferences })
}

export async function PUT(request) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  try {
    const body = await readJson(request)
    const giftRecordColumns = await updateGiftRecordColumnsPreference(
      user.id,
      body.giftRecordColumns
    )

    return Response.json({ preferences: { giftRecordColumns } })
  } catch (error) {
    return jsonError(error.message)
  }
}
