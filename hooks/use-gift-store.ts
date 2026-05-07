'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_GIFT_RECORD_COLUMNS,
  normalizeGiftRecordColumns,
  type GiftRecordColumnKey,
} from '@/lib/gift-record-columns.js'
import type {
  Event,
  EventAttachment,
  EventMember,
  EventMemberRole,
  GiftRecord,
  InterfaceStyle,
  Statistics,
} from '@/lib/types'

type EventInput = Omit<Event, 'id' | 'createdAt'>
type RecordInput = Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>

export function useGiftStore() {
  const [events, setEvents] = useState<Event[]>([])
  const [records, setRecords] = useState<GiftRecord[]>([])
  const [attachments, setAttachments] = useState<EventAttachment[]>([])
  const [giftRecordColumns, setGiftRecordColumnsState] =
    useState<GiftRecordColumnKey[]>(DEFAULT_GIFT_RECORD_COLUMNS)
  const [maskAmounts, setMaskAmountsState] = useState(false)
  const [interfaceStyle, setInterfaceStyleState] =
    useState<InterfaceStyle>('red')
  const [successVoiceURI, setSuccessVoiceURIState] = useState<string | null>(null)
  const [pdfCoverImageDataUrl, setPdfCoverImageDataUrlState] =
    useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)

    try {
      const [giftResponse, preferencesResponse] = await Promise.all([
        fetch('/api/gifts'),
        fetch('/api/preferences'),
      ])

      if (giftResponse.status === 401 || preferencesResponse.status === 401) {
        setEvents([])
        setRecords([])
        setAttachments([])
        setGiftRecordColumnsState(DEFAULT_GIFT_RECORD_COLUMNS)
        setMaskAmountsState(false)
        setInterfaceStyleState('red')
        setSuccessVoiceURIState(null)
        setPdfCoverImageDataUrlState(null)
        return
      }

      const [giftData, preferencesData] = await Promise.all([
        readResponseJson(giftResponse, '加载数据失败'),
        readResponseJson(preferencesResponse, '加载配置失败'),
      ])

      if (!giftResponse.ok) {
        throw new Error(giftData.error || '加载数据失败')
      }

      if (!preferencesResponse.ok) {
        throw new Error(preferencesData.error || '加载配置失败')
      }

      setEvents(giftData.events)
      setRecords(giftData.records)
      setAttachments(giftData.attachments ?? [])
      setGiftRecordColumnsState(
        normalizeGiftRecordColumns(preferencesData.preferences?.giftRecordColumns)
      )
      setMaskAmountsState(preferencesData.preferences?.maskAmounts === true)
      setInterfaceStyleState(
        normalizeInterfaceStyle(preferencesData.preferences?.interfaceStyle)
      )
      setSuccessVoiceURIState(
        normalizeNullablePreference(preferencesData.preferences?.successVoiceURI)
      )
      setPdfCoverImageDataUrlState(
        normalizeNullablePreference(
          preferencesData.preferences?.pdfCoverImageDataUrl
        )
      )
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addEvent = useCallback(async (event: EventInput) => {
    const data = await requestJson('/api/gifts', {
      method: 'POST',
      body: { kind: 'event', ...event },
    })
    const newEvent = data.event

    setEvents((prev) => [newEvent, ...prev])
    return newEvent
  }, [])

  const updateEvent = useCallback(async (id: string, updates: Partial<Event>) => {
    const data = await requestJson(`/api/events/${id}`, {
      method: 'PUT',
      body: updates,
    })
    const updatedEvent = data.event

    setEvents((prev) =>
      prev.map((event) => (event.id === id ? updatedEvent : event))
    )
    return updatedEvent
  }, [])

  const deleteEvent = useCallback(async (id: string) => {
    await requestJson(`/api/events/${id}`, { method: 'DELETE' })
    setEvents((prev) => prev.filter((event) => event.id !== id))
    setRecords((prev) => prev.filter((record) => record.eventId !== id))
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.eventId !== id)
    )
  }, [])

  const addRecord = useCallback(async (record: RecordInput) => {
    const data = await requestJson('/api/gifts', {
      method: 'POST',
      body: { kind: 'record', ...record },
    })
    const newRecord = data.record

    setRecords((prev) => [newRecord, ...prev])
    return newRecord
  }, [])

  const updateRecord = useCallback(
    async (id: string, updates: Partial<GiftRecord>) => {
      const data = await requestJson(`/api/records/${id}`, {
        method: 'PUT',
        body: updates,
      })
      const updatedRecord = data.record

      setRecords((prev) =>
        prev.map((record) => (record.id === id ? updatedRecord : record))
      )
      return updatedRecord
    },
    []
  )

  const deleteRecord = useCallback(async (id: string) => {
    await requestJson(`/api/records/${id}`, { method: 'DELETE' })
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }, [])

  const setGiftRecordColumns = useCallback(
    async (columns: GiftRecordColumnKey[]) => {
      const normalizedColumns = normalizeGiftRecordColumns(columns)

      setGiftRecordColumnsState(normalizedColumns)

      try {
        const data = await requestJson('/api/preferences', {
          method: 'PUT',
          body: { giftRecordColumns: normalizedColumns },
        })
        const savedColumns = normalizeGiftRecordColumns(
          data.preferences?.giftRecordColumns
        )

        setGiftRecordColumnsState(savedColumns)
        return savedColumns
      } catch (error) {
        await loadData()
        throw error
      }
    },
    [loadData]
  )

  const setMaskAmounts = useCallback(
    async (nextMaskAmounts: boolean) => {
      setMaskAmountsState(nextMaskAmounts)

      try {
        const data = await requestJson('/api/preferences', {
          method: 'PUT',
          body: { maskAmounts: nextMaskAmounts },
        })
        const savedMaskAmounts = data.preferences?.maskAmounts === true

        setMaskAmountsState(savedMaskAmounts)
        return savedMaskAmounts
      } catch (error) {
        await loadData()
        throw error
      }
    },
    [loadData]
  )

  const setInterfaceStyle = useCallback(
    async (nextInterfaceStyle: InterfaceStyle) => {
      const normalizedInterfaceStyle = normalizeInterfaceStyle(nextInterfaceStyle)
      setInterfaceStyleState(normalizedInterfaceStyle)

      try {
        const data = await requestJson('/api/preferences', {
          method: 'PUT',
          body: { interfaceStyle: normalizedInterfaceStyle },
        })
        const savedInterfaceStyle = normalizeInterfaceStyle(
          data.preferences?.interfaceStyle
        )

        setInterfaceStyleState(savedInterfaceStyle)
        return savedInterfaceStyle
      } catch (error) {
        await loadData()
        throw error
      }
    },
    [loadData]
  )

  const setSuccessVoiceURI = useCallback(
    async (nextVoiceURI: string | null) => {
      const normalizedVoiceURI = normalizeNullablePreference(nextVoiceURI)
      setSuccessVoiceURIState(normalizedVoiceURI)

      try {
        const data = await requestJson('/api/preferences', {
          method: 'PUT',
          body: { successVoiceURI: normalizedVoiceURI },
        })
        const savedVoiceURI = normalizeNullablePreference(
          data.preferences?.successVoiceURI
        )

        setSuccessVoiceURIState(savedVoiceURI)
        return savedVoiceURI
      } catch (error) {
        await loadData()
        throw error
      }
    },
    [loadData]
  )

  const setPdfCoverImageDataUrl = useCallback(
    async (nextDataUrl: string | null) => {
      const normalizedDataUrl = normalizeNullablePreference(nextDataUrl)
      setPdfCoverImageDataUrlState(normalizedDataUrl)

      try {
        const data = await requestJson('/api/preferences', {
          method: 'PUT',
          body: { pdfCoverImageDataUrl: normalizedDataUrl },
        })
        const savedDataUrl = normalizeNullablePreference(
          data.preferences?.pdfCoverImageDataUrl
        )

        setPdfCoverImageDataUrlState(savedDataUrl)
        return savedDataUrl
      } catch (error) {
        await loadData()
        throw error
      }
    },
    [loadData]
  )

  const importRecordsFromExcel = useCallback(async (
    eventId: string,
    file: File,
    options?: { confirmDuplicates?: boolean }
  ) => {
    const formData = new FormData()
    formData.append('file', file)

    const searchParams = new URLSearchParams()
    if (options?.confirmDuplicates) {
      searchParams.set('confirmDuplicates', 'true')
    }
    const query = searchParams.toString()
    const response = await fetch(
      `/api/events/${eventId}/records/import${query ? `?${query}` : ''}`,
      {
      method: 'POST',
      body: formData,
      }
    )
    const data = await readResponseJson(response, 'Excel 导入失败')

    if (!response.ok) {
      if (response.status === 409) {
        throw new DuplicateImportError(data)
      }

      throw new Error(data.error || 'Excel 导入失败')
    }

    setRecords((prev) => [...data.records, ...prev])
    return data.records
  }, [])

  const getRecordsByEvent = useCallback(
    (eventId: string) => records.filter((record) => record.eventId === eventId),
    [records]
  )

  const getAttachmentsByEvent = useCallback(
    (eventId: string) =>
      attachments.filter((attachment) => attachment.eventId === eventId),
    [attachments]
  )

  const uploadAttachments = useCallback(async (eventId: string, files: File[]) => {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch(`/api/events/${eventId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    const data = await readResponseJson(response, '上传失败')

    if (!response.ok) {
      throw new Error(data.error || '上传失败')
    }

    setAttachments((prev) => [...data.attachments, ...prev])
    return data.attachments
  }, [])

  const deleteAttachment = useCallback(async (id: string) => {
    await requestJson(`/api/attachments/${id}`, { method: 'DELETE' })
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }, [])

  const updateAttachment = useCallback(
    async (id: string, updates: Partial<EventAttachment>) => {
      const data = await requestJson(`/api/attachments/${id}`, {
        method: 'PATCH',
        body: updates,
      })
      const updatedAttachment = data.attachment

      setAttachments((prev) =>
        prev.map((attachment) =>
          attachment.id === id ? updatedAttachment : attachment
        )
      )
      return updatedAttachment
    },
    []
  )

  const listEventMembers = useCallback(async (eventId: string) => {
    const response = await fetch(`/api/events/${eventId}/members`)
    const data = await readResponseJson(response, '加载成员失败')

    if (!response.ok) {
      throw new Error(data.error || '加载成员失败')
    }

    return data.members as EventMember[]
  }, [])

  const saveEventMember = useCallback(
    async (
      eventId: string,
      member: { email: string; role: Exclude<EventMemberRole, 'owner'> }
    ) => {
      const data = await requestJson(`/api/events/${eventId}/members`, {
        method: 'POST',
        body: member,
      })

      return data.member as EventMember
    },
    []
  )

  const removeEventMember = useCallback(
    async (eventId: string, userId: string) => {
      await requestJson(`/api/events/${eventId}/members/${userId}`, {
        method: 'DELETE',
      })
    },
    []
  )

  const getStatistics = useCallback(
    (eventId?: string): Statistics => {
      const filteredRecords = eventId
        ? records.filter((record) => record.eventId === eventId)
        : records

      if (filteredRecords.length === 0) {
        return {
          totalAmount: 0,
          totalGuests: 0,
          averageAmount: 0,
          maxAmount: 0,
          minAmount: 0,
        }
      }

      const amounts = filteredRecords.map((record) => record.amount)
      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)

      return {
        totalAmount,
        totalGuests: filteredRecords.length,
        averageAmount: Math.round(totalAmount / filteredRecords.length),
        maxAmount: Math.max(...amounts),
        minAmount: Math.min(...amounts),
      }
    },
    [records]
  )

  return {
    events,
    records,
    attachments,
    giftRecordColumns,
    maskAmounts,
    interfaceStyle,
    successVoiceURI,
    pdfCoverImageDataUrl,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addRecord,
    updateRecord,
    deleteRecord,
    setGiftRecordColumns,
    setMaskAmounts,
    setInterfaceStyle,
    setSuccessVoiceURI,
    setPdfCoverImageDataUrl,
    importRecordsFromExcel,
    getRecordsByEvent,
    getAttachmentsByEvent,
    uploadAttachments,
    updateAttachment,
    deleteAttachment,
    listEventMembers,
    saveEventMember,
    removeEventMember,
    getStatistics,
    refresh: loadData,
  }
}

function normalizeInterfaceStyle(value: unknown): InterfaceStyle {
  return value === 'gray' ? 'gray' : 'red'
}

function normalizeNullablePreference(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

export class DuplicateImportError extends Error {
  duplicateCount: number
  totalCount: number

  constructor(data: { duplicateCount: number; totalCount: number }) {
    super('发现重复记录')
    this.name = 'DuplicateImportError'
    this.duplicateCount = data.duplicateCount
    this.totalCount = data.totalCount
  }
}

async function requestJson(
  url: string,
  options: { method: string; body?: unknown }
) {
  const response = await fetch(url, {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await readResponseJson(response, '请求失败')

  if (!response.ok) {
    throw new Error(data.error || '请求失败')
  }

  return data
}

async function readResponseJson(response: Response, fallbackMessage: string) {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(fallbackMessage)
  }
}
