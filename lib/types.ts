export type EventType = 
  | '婚礼' 
  | '百日宴' 
  | '寿宴' 
  | '满月酒' 
  | '乔迁宴' 
  | '升学宴' 
  | '开业庆典'
  | '其他'

export interface GiftRecord {
  id: string
  guestName: string
  amount: number
  giftItem: string
  relativeTitle?: string
  date: string
  eventId: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface EventAttachment {
  id: string
  eventId: string
  originalName: string
  displayName?: string
  note?: string
  mimeType: string
  sizeBytes: number
  url: string
  createdAt: string
}

export interface Event {
  id: string
  name: string
  type: EventType
  date: string
  location?: string
  description?: string
  createdAt: string
}

export interface Statistics {
  totalAmount: number
  totalGuests: number
  averageAmount: number
  maxAmount: number
  minAmount: number
}

export const EVENT_TYPES: EventType[] = [
  '婚礼',
  '百日宴',
  '寿宴',
  '满月酒',
  '乔迁宴',
  '升学宴',
  '开业庆典',
  '其他'
]

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  '婚礼': '💒',
  '百日宴': '👶',
  '寿宴': '🎂',
  '满月酒': '🍼',
  '乔迁宴': '🏠',
  '升学宴': '🎓',
  '开业庆典': '🎊',
  '其他': '🎁'
}
