import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildGiftRecordReturningSelect,
  buildGiftRecordRowSelect,
  mapEventRow,
  mapGiftRecordRow,
} from '../lib/db/gifts.js'

test('mapEventRow returns the client event shape', () => {
  const event = mapEventRow({
    id: 'event-1',
    name: '婚礼礼薄',
    type: '婚礼',
    event_date: '2026-05-07',
    bookkeeper_name: '王会计',
    location: null,
    description: '主桌',
    interface_style: 'gray',
    pdf_cover_image_data_url: 'data:image/png;base64,abc',
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
    interfaceStyle: 'gray',
    pdfCoverImageDataUrl: 'data:image/png;base64,abc',
    createdAt: '2026-05-07T10:00:00.000Z',
  })
})

test('mapEventRow falls back to red style', () => {
  const event = mapEventRow({
    id: 'event-1',
    name: '婚礼礼薄',
    type: '婚礼',
    event_date: '2026-05-07',
    bookkeeper_name: '王会计',
    created_at: '2026-05-07T10:00:00.000Z',
  })

  assert.equal(event.interfaceStyle, 'red')
  assert.equal(event.pdfCoverImageDataUrl, undefined)
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
    return_gift_done: true,
    return_gift_amount: '300.00',
    return_gift_note: '已微信转账',
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
    returnGiftDone: true,
    returnGiftAmount: 300,
    returnGiftNote: '已微信转账',
    date: '2026-05-07',
    eventId: 'event-1',
    note: '同事',
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-08T10:00:00.000Z',
  })
})

test('mapGiftRecordRow falls back when return gift columns are not selected', () => {
  const record = mapGiftRecordRow({
    id: 'record-1',
    guest_name: '张三',
    amount: '800.00',
    gift_item: null,
    record_date: '2026-05-07',
    event_id: 'event-1',
    created_at: '2026-05-07T10:00:00.000Z',
  })

  assert.equal(record.returnGiftDone, false)
  assert.equal(record.returnGiftAmount, undefined)
  assert.equal(record.returnGiftNote, undefined)
})

test('gift record select builders can omit physical return gift columns', () => {
  const rowSelect = buildGiftRecordRowSelect(false)
  const returningSelect = buildGiftRecordReturningSelect(false)

  assert.match(rowSelect, /false as return_gift_done/)
  assert.match(returningSelect, /false as return_gift_done/)
  assert.doesNotMatch(rowSelect, /gift_records\.return_gift_done/)
  assert.doesNotMatch(returningSelect, /(?<!as )return_gift_done,/)
})
