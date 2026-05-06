'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { useGiftStore } from '@/hooks/use-gift-store'
import { useAuthStore } from '@/hooks/use-auth-store'
import { Header } from './header'
import { StatisticsCards } from './statistics-cards'
import { EventCard } from './event-card'
import { EventFormDialog } from './event-form-dialog'
import { EventDetail } from './event-detail'
import { EmptyState } from './empty-state'
import { Spinner } from '@/components/ui/spinner'
import { exportAllToExcel } from '@/lib/export'
import type { Event, GiftRecord } from '@/lib/types'

export function GiftBookApp() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuthStore()
  
  const {
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
  } = useGiftStore()

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const selectedEvent = selectedEventId 
    ? events.find(e => e.id === selectedEventId) 
    : null

  const handleCreateEvent = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      await addEvent(data)
      toast.success('活动创建成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '活动创建失败')
    }
  }

  const handleUpdateEvent = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    if (editingEvent) {
      try {
        await updateEvent(editingEvent.id, data)
        toast.success('活动更新成功')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '活动更新失败')
      }
    }
    setEditingEvent(null)
  }

  const handleDeleteEvent = async () => {
    if (deleteEventId) {
      try {
        await deleteEvent(deleteEventId)
        if (selectedEventId === deleteEventId) {
          setSelectedEventId(null)
        }
        toast.success('活动已删除')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '活动删除失败')
      }
      setDeleteEventId(null)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventDialogOpen(true)
  }

  const handleEventDialogClose = (open: boolean) => {
    setEventDialogOpen(open)
    if (!open) {
      setEditingEvent(null)
    }
  }

  const handleAddRecord = async (data: Omit<GiftRecord, 'id' | 'createdAt'>) => {
    try {
      await addRecord(data)
      toast.success('礼金记录添加成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '礼金记录添加失败')
    }
  }

  const handleUpdateRecord = async (id: string, data: Partial<GiftRecord>) => {
    try {
      await updateRecord(id, data)
      toast.success('记录更新成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '记录更新失败')
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id)
      toast.success('记录已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '记录删除失败')
    }
  }

  const handleExportAll = () => {
    if (events.length === 0) {
      toast.error('暂无活动可导出')
      return
    }
    exportAllToExcel(events, records)
    toast.success('导出成功')
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {selectedEvent ? (
          <EventDetail
            event={selectedEvent}
            records={getRecordsByEvent(selectedEvent.id)}
            statistics={getStatistics(selectedEvent.id)}
            onBack={() => setSelectedEventId(null)}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        ) : events.length === 0 ? (
          <EmptyState onCreateEvent={() => setEventDialogOpen(true)} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">全部活动</h2>
                <p className="text-muted-foreground mt-1">
                  管理您的所有礼金往来记录
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportAll}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  导出全部
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setEventDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新建活动
                </Button>
              </div>
            </div>

            <StatisticsCards statistics={getStatistics()} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  records={getRecordsByEvent(event.id)}
                  onSelect={() => setSelectedEventId(event.id)}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => setDeleteEventId(event.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={handleEventDialogClose}
        event={editingEvent}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
      />

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除活动</AlertDialogTitle>
            <AlertDialogDescription>
              删除活动将同时删除该活动下的所有礼金记录，此操作无法撤销。确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
