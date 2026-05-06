'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Event, GiftRecord, Statistics } from '@/lib/types'

type EventInput = Omit<Event, 'id' | 'createdAt'>
type RecordInput = Omit<GiftRecord, 'id' | 'createdAt'>

export function useGiftStore() {
  const [events, setEvents] = useState<Event[]>([])
  const [records, setRecords] = useState<GiftRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/gifts')

      if (response.status === 401) {
        setEvents([])
        setRecords([])
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '加载数据失败')
      }

      setEvents(data.events)
      setRecords(data.records)
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

  const getRecordsByEvent = useCallback(
    (eventId: string) => records.filter((record) => record.eventId === eventId),
    [records]
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
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordsByEvent,
    getStatistics,
    refresh: loadData,
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
