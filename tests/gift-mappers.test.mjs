import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mapEventRow, mapGiftRecordRow } from '../lib/db/gifts.js'

test('mapEventRow returns the client event shape', () => {
  const event = mapEventRow({
    id: 'event-1',
    name: '婚礼礼薄',
    type: '婚礼',
    event_date: '2026-05-07',
    bookkeeper_name: '王会计',
    location: null,
    description: '主桌',
    created_at: '2026-05-07T10:00:00.000Z',
  })

  assert.deepEqual(event, {
    id: 'event-1',
    name: '婚礼礼薄',
    type: '婚礼',
    date: '2026-05-07',
    bookkeeperName: '王会计',
    location: undefined,
    description: '主桌',
    createdAt: '2026-05-07T10:00:00.000Z',
  })
})

test('mapGiftRecordRow returns the client record shape', () => {
  const record = mapGiftRecordRow({
    id: 'record-1',
    guest_name: '张三',
    amount: '800.00',
    gift_item: null,
    relative_title: '表哥',
    phone_number: '13800138000',
    home_address: '北京市朝阳区',
    record_date: '2026-05-07',
    event_id: 'event-1',
    note: '同事',
    created_at: '2026-05-07T10:00:00.000Z',
    updated_at: '2026-05-08T10:00:00.000Z',
  })

  assert.deepEqual(record, {
    id: 'record-1',
    guestName: '张三',
    amount: 800,
    giftItem: '',
    relativeTitle: '表哥',
    phoneNumber: '13800138000',
    homeAddress: '北京市朝阳区',
    date: '2026-05-07',
    eventId: 'event-1',
    note: '同事',
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
  })
})
