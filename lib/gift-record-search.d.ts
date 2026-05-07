import type { GiftRecord } from './types'

export interface GiftRecordSearchQuery {
  text: string
  amountRange: { min: number; max: number } | null
}

export function parseGiftRecordSearchQuery(
  query: string
): GiftRecordSearchQuery

export function filterGiftRecordsBySearchQuery(
  records: GiftRecord[],
  query: string
): GiftRecord[]
