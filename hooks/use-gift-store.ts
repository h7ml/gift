'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Event, GiftRecord, Statistics } from '@/lib/types'

const EVENTS_KEY = 'libu_events'
const RECORDS_KEY = 'libu_records'

export function useGiftStore() {
  const [events, setEvents] = useState<Event[]>([])
  const [records, setRecords] = useState<GiftRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 从 localStorage 加载数据
  useEffect(() => {
    const loadData = () => {
      try {
        const savedEvents = localStorage.getItem(EVENTS_KEY)
        const savedRecords = localStorage.getItem(RECORDS_KEY)
        
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents))
        }
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords))
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 保存 events 到 localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
    }
  }, [events, isLoading])

  // 保存 records 到 localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
    }
  }, [records, isLoading])

  // 添加活动
  const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    setEvents(prev => [newEvent, ...prev])
    return newEvent
  }, [])

  // 更新活动
  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ))
  }, [])

  // 删除活动
  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
    setRecords(prev => prev.filter(record => record.eventId !== id))
  }, [])

  // 添加礼金记录
  const addRecord = useCallback((record: Omit<GiftRecord, 'id' | 'createdAt'>) => {
    const newRecord: GiftRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    setRecords(prev => [newRecord, ...prev])
    return newRecord
  }, [])

  // 更新礼金记录
  const updateRecord = useCallback((id: string, updates: Partial<GiftRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ))
  }, [])

  // 删除礼金记录
  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id))
  }, [])

  // 获取指定活动的礼金记录
  const getRecordsByEvent = useCallback((eventId: string) => {
    return records.filter(record => record.eventId === eventId)
  }, [records])

  // 计算统计数据
  const getStatistics = useCallback((eventId?: string): Statistics => {
    const filteredRecords = eventId 
      ? records.filter(r => r.eventId === eventId)
      : records

    if (filteredRecords.length === 0) {
      return {
        totalAmount: 0,
        totalGuests: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0
      }
    }

    const amounts = filteredRecords.map(r => r.amount)
    const totalAmount = amounts.reduce((sum, a) => sum + a, 0)

    return {
      totalAmount,
      totalGuests: filteredRecords.length,
      averageAmount: Math.round(totalAmount / filteredRecords.length),
      maxAmount: Math.max(...amounts),
      minAmount: Math.min(...amounts)
    }
  }, [records])

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
    getStatistics
  }
}
