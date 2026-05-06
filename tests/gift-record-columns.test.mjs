import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DEFAULT_GIFT_RECORD_COLUMNS,
  GIFT_RECORD_COLUMN_KEYS,
  normalizeGiftRecordColumns,
} from '../lib/gift-record-columns.js'

test('normalizeGiftRecordColumns keeps valid unique columns in order', () => {
  assert.deepEqual(
    normalizeGiftRecordColumns(['amount', 'guestName', 'amount', 'invalid']),
    ['amount', 'guestName']
  )
})

test('normalizeGiftRecordColumns falls back to default columns', () => {
  assert.deepEqual(normalizeGiftRecordColumns([]), DEFAULT_GIFT_RECORD_COLUMNS)
  assert.deepEqual(
    normalizeGiftRecordColumns(['invalid']),
    DEFAULT_GIFT_RECORD_COLUMNS
  )
})

test('all gift record columns include every configurable key', () => {
  assert.deepEqual(GIFT_RECORD_COLUMN_KEYS, [
    'guestName',
    'relativeTitle',
    'amount',
    'amountUppercase',
    'giftItem',
    'date',
    'note',
    'createdAt',
    'updatedAt',
  ])
})
