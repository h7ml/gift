import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mapPreferencesRows } from '../lib/db/preferences.js'

test('mapPreferencesRows maps gift record columns preference', () => {
  assert.deepEqual(
    mapPreferencesRows([
      {
        preference_key: 'gift_record_columns',
        preference_value: ['amount', 'guestName', 'invalid'],
      },
    ]),
    { giftRecordColumns: ['amount', 'guestName'] }
  )
})

test('mapPreferencesRows falls back to default record columns', () => {
  assert.deepEqual(mapPreferencesRows([]), {
    giftRecordColumns: ['guestName', 'amount'],
  })
})
