import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as XLSX from 'xlsx'

import {
  findDuplicateGiftRecordNames,
  findDuplicateGiftRecords,
  normalizeGiftRecordName,
  parseGiftRecordsFromExcelBuffer,
} from '../lib/excel-import.js'

test('parseGiftRecordsFromExcelBuffer reads exported gift rows and skips summary', () => {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      '序号': 1,
      '姓名': '张三',
      '亲戚称谓': '表哥',
      '联系电话': '13800138000',
      '住宅地址': '北京市朝阳区',
      '金额（元）': 800,
      '已还礼': '是',
      '还礼金额': 300,
      '还礼备注': '微信转账',
      '礼品': '红包',
      '日期': '2026-05-07',
      '备注': '同事',
    },
    {
      '序号': '',
      '姓名': '合计',
      '金额（元）': 800,
      '礼品': '-',
      '日期': '-',
      '备注': '共 1 人',
    },
  ])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '礼薄')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  const records = parseGiftRecordsFromExcelBuffer(buffer, 'event-1')

  assert.deepEqual(records, [
    {
      guestName: '张三',
      amount: 800,
      relativeTitle: '表哥',
      phoneNumber: '13800138000',
      homeAddress: '北京市朝阳区',
      returnGiftDone: true,
      returnGiftAmount: 300,
      returnGiftNote: '微信转账',
      giftItem: '红包',
      date: '2026-05-07',
      eventId: 'event-1',
      note: '同事',
    },
  ])
})

test('findDuplicateGiftRecords matches same guest amount gift and date', () => {
  const duplicate = {
    guestName: '张三',
    amount: 800,
    giftItem: '红包',
    date: '2026-05-07',
    eventId: 'event-1',
  }

  const duplicates = findDuplicateGiftRecords([duplicate], [
    {
      ...duplicate,
      id: 'record-1',
      note: '已存在',
      createdAt: '2026-05-07T10:00:00.000Z',
    },
  ])

  assert.deepEqual(duplicates, [duplicate])
})

test('findDuplicateGiftRecordNames matches existing and imported duplicate names', () => {
  const importRecords = [
    { guestName: ' 张 三 ', amount: 500, eventId: 'event-1' },
    { guestName: '李四', amount: 600, eventId: 'event-1' },
    { guestName: '李 四', amount: 800, eventId: 'event-1' },
  ]

  assert.deepEqual(
    findDuplicateGiftRecordNames(importRecords, [
      { guestName: '张三', amount: 200, eventId: 'event-1' },
    ]),
    [importRecords[0], importRecords[2]]
  )
})

test('normalizeGiftRecordName trims whitespace and ignores case', () => {
  assert.equal(normalizeGiftRecordName(' Alice Wang '), 'alicewang')
  assert.equal(normalizeGiftRecordName('张 三'), '张三')
})
