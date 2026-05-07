import * as XLSX from 'xlsx'

export function parseGiftRecordsFromExcelBuffer(buffer, eventId) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    return []
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: '',
  })

  return rows
    .map((row) => mapImportRow(row, eventId))
    .filter(Boolean)
}

export function findDuplicateGiftRecords(importRecords, existingRecords) {
  const existingKeys = new Set(existingRecords.map(buildGiftRecordKey))

  return importRecords.filter((record) => existingKeys.has(buildGiftRecordKey(record)))
}

export function findDuplicateGiftRecordNames(importRecords, existingRecords = []) {
  const seenNames = new Set(existingRecords.map((record) => normalizeGiftRecordName(record.guestName)))
  const duplicates = []

  for (const record of importRecords) {
    const normalizedName = normalizeGiftRecordName(record.guestName)

    if (!normalizedName) {
      continue
    }

    if (seenNames.has(normalizedName)) {
      duplicates.push(record)
      continue
    }

    seenNames.add(normalizedName)
  }

  return duplicates
}

export function buildGiftRecordKey(record) {
  return [
    normalizeKeyPart(record.guestName),
    Number(record.amount).toFixed(2),
    normalizeKeyPart(record.giftItem),
    normalizeKeyPart(record.date),
  ].join('|')
}

function mapImportRow(row, eventId) {
  const guestName = readCell(row, ['姓名', '送礼人姓名', 'guestName', 'name'])

  if (!guestName || guestName === '合计') {
    return null
  }

  const amount = Number(readCell(row, ['金额（元）', '金额', 'amount']))

  if (!Number.isFinite(amount) || amount < 0) {
    return null
  }

  return {
    guestName,
    amount,
    relativeTitle: normalizeOptional(
      readCell(row, ['亲戚称谓', '称谓', '关系', 'relativeTitle'])
    ),
    phoneNumber: normalizeOptional(
      readCell(row, ['联系电话', '联系方式', '电话', '手机号', 'phoneNumber', 'phone'])
    ),
    homeAddress: normalizeOptional(
      readCell(row, ['住宅地址', '地址', '住址', 'homeAddress', 'address'])
    ),
    returnGiftDone: normalizeBoolean(
      readCell(row, ['已还礼', '是否还礼', '还礼状态', 'returnGiftDone'])
    ),
    returnGiftAmount: normalizeAmount(
      readCell(row, ['还礼金额', '回礼金额', 'returnGiftAmount'])
    ),
    returnGiftNote: normalizeOptional(
      readCell(row, ['还礼备注', '回礼备注', 'returnGiftNote'])
    ),
    giftItem: normalizeOptional(readCell(row, ['礼品', '礼品内容', 'giftItem'])),
    date: normalizeDate(readCell(row, ['日期', 'date'])) ?? todayString(),
    eventId,
    note: normalizeOptional(readCell(row, ['备注', 'note'])),
  }
}

function readCell(row, keys) {
  for (const key of keys) {
    const value = row[key]

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }

  return ''
}

function normalizeOptional(value) {
  const text = String(value ?? '').trim()
  return text === '' || text === '-' ? undefined : text
}

function normalizeAmount(value) {
  const text = String(value ?? '').trim()

  if (!text || text === '-') {
    return undefined
  }

  const amount = Number(text)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

function normalizeBoolean(value) {
  const text = String(value ?? '').trim().toLowerCase()

  return ['true', 'yes', 'y', '1', '是', '已还', '已还礼'].includes(text)
}

function normalizeDate(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  const text = String(value ?? '').trim()

  if (!text || text === '-') {
    return undefined
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`
  }

  const zhMatch = text.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/)

  if (zhMatch) {
    return `${zhMatch[1]}-${zhMatch[2].padStart(2, '0')}-${zhMatch[3].padStart(2, '0')}`
  }

  return undefined
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeKeyPart(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function normalizeGiftRecordName(value) {
  return String(value ?? '').trim().replace(/\s+/g, '').toLowerCase()
}
