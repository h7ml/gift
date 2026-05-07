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
    {
      giftRecordColumns: ['amount', 'guestName'],
      maskAmounts: false,
      interfaceStyle: 'red',
      successVoiceURI: null,
      pdfCoverImageDataUrl: null,
    }
  )
})

test('mapPreferencesRows falls back to default record columns', () => {
  assert.deepEqual(mapPreferencesRows([]), {
    giftRecordColumns: ['guestName', 'amount'],
    maskAmounts: false,
    interfaceStyle: 'red',
    successVoiceURI: null,
    pdfCoverImageDataUrl: null,
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
    {
      giftRecordColumns: ['guestName', 'amount'],
      maskAmounts: true,
      interfaceStyle: 'red',
      successVoiceURI: null,
      pdfCoverImageDataUrl: null,
    }
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
    {
      giftRecordColumns: ['guestName', 'amount'],
      maskAmounts: true,
      interfaceStyle: 'red',
      successVoiceURI: null,
      pdfCoverImageDataUrl: null,
    }
  )
})

test('mapPreferencesRows maps interface style voice and pdf cover preferences', () => {
  assert.deepEqual(
    mapPreferencesRows([
      {
        preference_key: 'interface_style',
        preference_value: 'gray',
      },
      {
        preference_key: 'success_voice_uri',
        preference_value: 'voice-1',
      },
      {
        preference_key: 'pdf_cover_image_data_url',
        preference_value: 'data:image/png;base64,abc',
      },
    ]),
    {
      giftRecordColumns: ['guestName', 'amount'],
      maskAmounts: false,
      interfaceStyle: 'gray',
      successVoiceURI: 'voice-1',
      pdfCoverImageDataUrl: 'data:image/png;base64,abc',
    }
  )
})
