import { jsonError, readJson } from '@/lib/api.js'
import {
  listUserPreferences,
  updateGiftRecordColumnsPreference,
  updateInterfaceStylePreference,
  updateMaskAmountsPreference,
  updatePdfCoverImageDataUrlPreference,
  updateSuccessVoiceURIPreference,
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

    if (Object.hasOwn(body, 'interfaceStyle')) {
      preferences.interfaceStyle = await updateInterfaceStylePreference(
        user.id,
        body.interfaceStyle
      )
    }

    if (Object.hasOwn(body, 'successVoiceURI')) {
      preferences.successVoiceURI = await updateSuccessVoiceURIPreference(
        user.id,
        body.successVoiceURI
      )
    }

    if (Object.hasOwn(body, 'pdfCoverImageDataUrl')) {
      preferences.pdfCoverImageDataUrl =
        await updatePdfCoverImageDataUrlPreference(
          user.id,
          body.pdfCoverImageDataUrl
        )
    }

    return Response.json({ preferences })
  } catch (error) {
    return jsonError(error.message)
  }
}
