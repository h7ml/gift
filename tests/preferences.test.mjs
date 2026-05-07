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
    { giftRecordColumns: ['amount', 'guestName'], maskAmounts: false }
  )
})

test('mapPreferencesRows falls back to default record columns', () => {
  assert.deepEqual(mapPreferencesRows([]), {
    giftRecordColumns: ['guestName', 'amount'],
    maskAmounts: false,
  })
})

test('mapPreferencesRows maps amount masking preference', () => {
  assert.deepEqual(
    mapPreferencesRows([
      {
        preference_key: 'mask_amounts',
        preference_value: true,
      },
    ]),
    { giftRecordColumns: ['guestName', 'amount'], maskAmounts: true }
  )
})

test('mapPreferencesRows maps string amount masking preference', () => {
  assert.deepEqual(
    mapPreferencesRows([
      {
        preference_key: 'mask_amounts',
        preference_value: 'true',
      },
    ]),
    { giftRecordColumns: ['guestName', 'amount'], maskAmounts: true }
  )
})
