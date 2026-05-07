export const GIFT_RECORD_COLUMN_KEYS = [
  'guestName',
  'relativeTitle',
  'phoneNumber',
  'homeAddress',
  'amount',
  'amountUppercase',
  'giftItem',
  'date',
  'note',
  'createdAt',
  'updatedAt',
]

export const DEFAULT_GIFT_RECORD_COLUMNS = ['guestName', 'amount']

export function normalizeGiftRecordColumns(columns) {
  if (!Array.isArray(columns)) {
    return DEFAULT_GIFT_RECORD_COLUMNS
  }

  const normalizedColumns = columns.filter(
    (column, index) =>
      typeof column === 'string' &&
      GIFT_RECORD_COLUMN_KEYS.includes(column) &&
      columns.indexOf(column) === index
  )

  return normalizedColumns.length > 0
    ? normalizedColumns
    : DEFAULT_GIFT_RECORD_COLUMNS
}
