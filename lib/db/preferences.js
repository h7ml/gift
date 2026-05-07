import { query } from './client.js'
import { normalizeGiftRecordColumns } from '../gift-record-columns.js'

export const GIFT_RECORD_COLUMNS_PREFERENCE_KEY = 'gift_record_columns'
export const MASK_AMOUNTS_PREFERENCE_KEY = 'mask_amounts'
export const INTERFACE_STYLE_PREFERENCE_KEY = 'interface_style'
export const SUCCESS_VOICE_URI_PREFERENCE_KEY = 'success_voice_uri'
export const PDF_COVER_IMAGE_DATA_URL_PREFERENCE_KEY = 'pdf_cover_image_data_url'
export const DEFAULT_INTERFACE_STYLE = 'red'
export const INTERFACE_STYLES = ['red', 'gray']

export function mapPreferencesRows(rows) {
  const preferences = {}

  for (const row of rows) {
    preferences[row.preference_key] = row.preference_value
  }

  return {
    giftRecordColumns: normalizeGiftRecordColumns(
      preferences[GIFT_RECORD_COLUMNS_PREFERENCE_KEY]
    ),
    maskAmounts: normalizeMaskAmounts(preferences[MASK_AMOUNTS_PREFERENCE_KEY]),
    interfaceStyle: normalizeInterfaceStyle(
      preferences[INTERFACE_STYLE_PREFERENCE_KEY]
    ),
    successVoiceURI: normalizeNullableString(
      preferences[SUCCESS_VOICE_URI_PREFERENCE_KEY]
    ),
    pdfCoverImageDataUrl: normalizePdfCoverImageDataUrl(
      preferences[PDF_COVER_IMAGE_DATA_URL_PREFERENCE_KEY]
    ),
  }
}

export async function listUserPreferences(userId) {
  const result = await query(
    `select preference_key, preference_value
     from user_preferences
     where user_id = $1`,
    [userId]
  )

  return mapPreferencesRows(result.rows)
}

export async function updateGiftRecordColumnsPreference(userId, columns) {
  const normalizedColumns = normalizeGiftRecordColumns(columns)

  await query(
    `insert into user_preferences (user_id, preference_key, preference_value, updated_at)
     values ($1, $2, $3::jsonb, now())
     on conflict (user_id, preference_key)
     do update set preference_value = excluded.preference_value,
                   updated_at = now()`,
    [
      userId,
      GIFT_RECORD_COLUMNS_PREFERENCE_KEY,
      JSON.stringify(normalizedColumns),
    ]
  )

  return normalizedColumns
}

export async function updateMaskAmountsPreference(userId, maskAmounts) {
  const normalizedMaskAmounts = normalizeMaskAmounts(maskAmounts)

  await query(
    `insert into user_preferences (user_id, preference_key, preference_value, updated_at)
     values ($1, $2, $3::jsonb, now())
     on conflict (user_id, preference_key)
     do update set preference_value = excluded.preference_value,
                   updated_at = now()`,
    [
      userId,
      MASK_AMOUNTS_PREFERENCE_KEY,
      JSON.stringify(normalizedMaskAmounts),
    ]
  )

  return normalizedMaskAmounts
}

export async function updateInterfaceStylePreference(userId, interfaceStyle) {
  const normalizedInterfaceStyle = normalizeInterfaceStyle(interfaceStyle)

  await upsertPreference(
    userId,
    INTERFACE_STYLE_PREFERENCE_KEY,
    normalizedInterfaceStyle
  )

  return normalizedInterfaceStyle
}

export async function updateSuccessVoiceURIPreference(userId, voiceURI) {
  const normalizedVoiceURI = normalizeNullableString(voiceURI)

  await upsertPreference(userId, SUCCESS_VOICE_URI_PREFERENCE_KEY, normalizedVoiceURI)

  return normalizedVoiceURI
}

export async function updatePdfCoverImageDataUrlPreference(userId, dataUrl) {
  const normalizedDataUrl = normalizePdfCoverImageDataUrl(dataUrl)

  await upsertPreference(
    userId,
    PDF_COVER_IMAGE_DATA_URL_PREFERENCE_KEY,
    normalizedDataUrl
  )

  return normalizedDataUrl
}

function normalizeMaskAmounts(value) {
  return value === true || value === 'true'
}

function normalizeInterfaceStyle(value) {
  return INTERFACE_STYLES.includes(value) ? value : DEFAULT_INTERFACE_STYLE
}

function normalizeNullableString(value) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function normalizePdfCoverImageDataUrl(value) {
  const normalizedValue = normalizeNullableString(value)

  if (!normalizedValue) {
    return null
  }

  if (
    !/^data:image\/(png|jpeg|jpg);base64,/i.test(normalizedValue) ||
    normalizedValue.length > 3_000_000
  ) {
    throw new Error('封面图格式错误或超过 2MB')
  }

  return normalizedValue
}

async function upsertPreference(userId, key, value) {
  await query(
    `insert into user_preferences (user_id, preference_key, preference_value, updated_at)
     values ($1, $2, $3::jsonb, now())
     on conflict (user_id, preference_key)
     do update set preference_value = excluded.preference_value,
                   updated_at = now()`,
    [userId, key, JSON.stringify(value)]
  )
}
