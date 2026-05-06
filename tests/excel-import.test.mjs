import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as XLSX from 'xlsx'

import {
  findDuplicateGiftRecords,
  parseGiftRecordsFromExcelBuffer,
} from '../lib/excel-import.js'

test('parseGiftRecordsFromExcelBuffer reads exported gift rows and skips summary', () => {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      '序号': 1,
      '姓名': '张三',
      '亲戚称谓': '表哥',
      '金额（元）': 800,
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
