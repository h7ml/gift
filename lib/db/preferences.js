import { query } from './client.js'
import { normalizeGiftRecordColumns } from '../gift-record-columns.js'

export const GIFT_RECORD_COLUMNS_PREFERENCE_KEY = 'gift_record_columns'

export function mapPreferencesRows(rows) {
  const preferences = {}

  for (const row of rows) {
    preferences[row.preference_key] = row.preference_value
  }

  return {
    giftRecordColumns: normalizeGiftRecordColumns(
      preferences[GIFT_RECORD_COLUMNS_PREFERENCE_KEY]
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
