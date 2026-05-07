import { jsonError, readJson } from '@/lib/api.js'
import {
  listUserPreferences,
  updateGiftRecordColumnsPreference,
  updateMaskAmountsPreference,
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
    const preferences = {}

    if (Object.hasOwn(body, 'giftRecordColumns')) {
      preferences.giftRecordColumns = await updateGiftRecordColumnsPreference(
        user.id,
        body.giftRecordColumns
      )
    }

    if (Object.hasOwn(body, 'maskAmounts')) {
      preferences.maskAmounts = await updateMaskAmountsPreference(
        user.id,
        body.maskAmounts
      )
    }

    return Response.json({ preferences })
  } catch (error) {
    return jsonError(error.message)
  }
}
