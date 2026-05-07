import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  filterGiftRecordsBySearchQuery,
  parseGiftRecordSearchQuery,
} from '../lib/gift-record-search.js'

const records = [
  buildRecord({ id: '1', guestName: '张三', amount: 200, giftItem: '现金' }),
  buildRecord({
    id: '2',
    guestName: '李四',
    amount: 500,
    relativeTitle: '表哥',
    phoneNumber: '13800138000',
    homeAddress: '北京市朝阳区',
  }),
  buildRecord({ id: '3', guestName: '王五', amount: 800, note: '红包' }),
  buildRecord({
    id: '4',
    guestName: '赵六',
    amount: 1000,
    returnGiftDone: true,
    returnGiftAmount: 300,
    returnGiftNote: '微信还礼',
  }),
]

test('parseGiftRecordSearchQuery parses exact amount query', () => {
  assert.deepEqual(parseGiftRecordSearchQuery('500'), {
    text: '500',
    amountRange: { min: 500, max: 500 },
  })
})

test('parseGiftRecordSearchQuery parses amount range query', () => {
  assert.deepEqual(parseGiftRecordSearchQuery('200-800'), {
    text: '200-800',
    amountRange: { min: 200, max: 800 },
  })
})

test('parseGiftRecordSearchQuery normalizes reversed amount range query', () => {
  assert.deepEqual(parseGiftRecordSearchQuery('800 到 200'), {
    text: '800 到 200',
    amountRange: { min: 200, max: 800 },
  })
})

test('filterGiftRecordsBySearchQuery matches text fields', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '表哥').map((record) => record.id),
    ['2']
  )
})

test('filterGiftRecordsBySearchQuery matches phone number', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '1380').map((record) => record.id),
    ['2']
  )
})

test('filterGiftRecordsBySearchQuery matches home address', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '朝阳').map((record) => record.id),
    ['2']
  )
})

test('filterGiftRecordsBySearchQuery matches exact amount', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '500').map((record) => record.id),
    ['2']
  )
})

test('filterGiftRecordsBySearchQuery matches amount range inclusively', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '200~500').map((record) => record.id),
    ['1', '2', '4']
  )
})

test('filterGiftRecordsBySearchQuery matches return gift note and amount', () => {
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '微信还礼').map((record) => record.id),
    ['4']
  )
  assert.deepEqual(
    filterGiftRecordsBySearchQuery(records, '300').map((record) => record.id),
    ['4']
  )
})

function buildRecord(overrides) {
  return {
    id: overrides.id,
    guestName: overrides.guestName,
    amount: overrides.amount,
    giftItem: overrides.giftItem ?? '',
    relativeTitle: overrides.relativeTitle,
    phoneNumber: overrides.phoneNumber,
    homeAddress: overrides.homeAddress,
    returnGiftDone: overrides.returnGiftDone ?? false,
    returnGiftAmount: overrides.returnGiftAmount,
    returnGiftNote: overrides.returnGiftNote,
    date: '2026-05-07',
    eventId: 'event-1',
    note: overrides.note,
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-07T10:00:00.000Z',
  }
}
