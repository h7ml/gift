'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Event, EventAttachment, GiftRecord, Statistics } from '@/lib/types'

type EventInput = Omit<Event, 'id' | 'createdAt'>
type RecordInput = Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>

export function useGiftStore() {
  const [events, setEvents] = useState<Event[]>([])
  const [records, setRecords] = useState<GiftRecord[]>([])
  const [attachments, setAttachments] = useState<EventAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/gifts')

      if (response.status === 401) {
        setEvents([])
        setRecords([])
        setAttachments([])
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '加载数据失败')
      }

      setEvents(data.events)
      setRecords(data.records)
      setAttachments(data.attachments ?? [])
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
    const data = await response.json()

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
    const data = await response.json()

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
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addRecord,
    updateRecord,
    deleteRecord,
    importRecordsFromExcel,
    getRecordsByEvent,
    getAttachmentsByEvent,
    uploadAttachments,
    updateAttachment,
    deleteAttachment,
    getStatistics,
    refresh: loadData,
  }
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
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || '请求失败')
  }

  return data
}
