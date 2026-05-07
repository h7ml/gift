export type GiftRecordColumnKey =
  | 'guestName'
  | 'relativeTitle'
  | 'phoneNumber'
  | 'homeAddress'
  | 'amount'
  | 'amountUppercase'
  | 'giftItem'
  | 'date'
  | 'note'
  | 'createdAt'
  | 'updatedAt'

export const GIFT_RECORD_COLUMN_KEYS: GiftRecordColumnKey[]

export const DEFAULT_GIFT_RECORD_COLUMNS: GiftRecordColumnKey[]

export function normalizeGiftRecordColumns(
  columns: unknown
): GiftRecordColumnKey[]
