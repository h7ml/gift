'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from './header'
import { EventDetail } from './event-detail'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/hooks/use-auth-store'
import { DuplicateImportError, useGiftStore } from '@/hooks/use-gift-store'
import type { EventAttachment, GiftRecord } from '@/lib/types'

interface EventDetailPageProps {
  eventId: string
}

export function EventDetailPage({ eventId }: EventDetailPageProps) {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuthStore()
  const {
    events,
    isLoading,
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
  } = useGiftStore()
  const [pendingImport, setPendingImport] = useState<File | null>(null)
  const [duplicateImport, setDuplicateImport] = useState<{
    duplicateCount: number
    totalCount: number
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const event = events.find((item) => item.id === eventId)

  const handleAddRecord = async (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const runImport = async (file: File, confirmDuplicates = false) => {
    try {
      const importedRecords = await importRecordsFromExcel(eventId, file, {
        confirmDuplicates,
      })
      setPendingImport(null)
      setDuplicateImport(null)
      toast.success(`已导入 ${importedRecords.length} 条记录`)
    } catch (error) {
      if (error instanceof DuplicateImportError) {
        setPendingImport(file)
        setDuplicateImport({
          duplicateCount: error.duplicateCount,
          totalCount: error.totalCount,
        })
        return
      }

      toast.error(error instanceof Error ? error.message : 'Excel 导入失败')
    }
  }

  const handleUploadAttachments = async (currentEventId: string, files: File[]) => {
    try {
      await uploadAttachments(currentEventId, files)
      toast.success('文件上传成功')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件上传失败')
    }
  }

  const handleUpdateAttachment = async (
    id: string,
    data: Pick<EventAttachment, 'displayName' | 'note'>
  ) => {
    try {
      await updateAttachment(id, data)
      toast.success('文件信息已更新')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件信息更新失败')
    }
  }

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id)
      toast.success('文件已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件删除失败')
    }
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

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <p className="text-muted-foreground">活动不存在或无权访问</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <EventDetail
          event={event}
          records={getRecordsByEvent(event.id)}
          attachments={getAttachmentsByEvent(event.id)}
          statistics={getStatistics(event.id)}
          duplicateImport={duplicateImport}
          onBack={() => router.push('/')}
          onAddRecord={handleAddRecord}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
          onImportRecords={(currentEventId, file) => runImport(file)}
          onConfirmImportDuplicates={() => {
            if (pendingImport) {
              runImport(pendingImport, true)
            }
          }}
          onCancelImportDuplicates={() => {
            setPendingImport(null)
            setDuplicateImport(null)
          }}
          onUploadAttachments={handleUploadAttachments}
          onUpdateAttachment={handleUpdateAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      </main>
    </div>
  )
}
