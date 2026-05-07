'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from './header'
import { EventDetail } from './event-detail'
import { Spinner } from '@/components/ui/spinner'
import { useAuthStore } from '@/hooks/use-auth-store'
import { DuplicateImportError, useGiftStore } from '@/hooks/use-gift-store'
import type { GiftRecordColumnKey } from '@/lib/gift-record-columns.js'
import { buildPageTitle } from '@/lib/page-title.js'
import { notifySuccess } from '@/lib/success-feedback.js'
import type { Event, EventAttachment, GiftRecord } from '@/lib/types'

interface EventDetailPageProps {
  eventId: string
  section?: 'overview' | 'notes' | 'records'
}

export function EventDetailPage({
  eventId,
  section = 'overview',
}: EventDetailPageProps) {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuthStore()
  const {
    events,
    isLoading,
    updateEvent,
    addRecord,
    updateRecord,
    deleteRecord,
    giftRecordColumns,
    maskAmounts,
    interfaceStyle,
    successVoiceURI,
    setGiftRecordColumns,
    setMaskAmounts,
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

  useEffect(() => {
    const sectionTitle =
      section === 'notes'
        ? '活动手记'
        : section === 'records'
          ? '礼金记录'
          : ''
    const title = event?.name
      ? [event.name, sectionTitle].filter(Boolean).join(' - ')
      : sectionTitle || '活动详情'

    document.title = buildPageTitle(title)
  }, [event?.name, section])

  useEffect(() => {
    document.documentElement.dataset.interfaceStyle =
      event?.interfaceStyle ?? interfaceStyle
  }, [event?.interfaceStyle, interfaceStyle])

  const handleAddRecord = async (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addRecord(data)
      notifySuccess('礼金记录添加成功', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '礼金记录添加失败')
    }
  }

  const handleUpdateEvent = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      await updateEvent(eventId, data)
      notifySuccess('活动设置已保存', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '活动设置保存失败')
    }
  }

  const handleUpdateRecord = async (id: string, data: Partial<GiftRecord>) => {
    try {
      await updateRecord(id, data)
      notifySuccess('记录更新成功', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '记录更新失败')
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id)
      notifySuccess('记录已删除', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '记录删除失败')
    }
  }

  const handleDeleteRecords = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteRecord(id)))
      notifySuccess(`已删除 ${ids.length} 条记录`, { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量删除失败')
    }
  }

  const handleUpdateGiftRecordColumns = async (
    columns: GiftRecordColumnKey[]
  ) => {
    try {
      return await setGiftRecordColumns(columns)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '列配置保存失败')
      return giftRecordColumns
    }
  }

  const handleMaskAmountsChange = async (checked: boolean) => {
    try {
      await setMaskAmounts(checked)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '金额显示配置保存失败')
    }
  }

  const runImport = async (file: File, confirmDuplicates = false) => {
    try {
      const importedRecords = await importRecordsFromExcel(eventId, file, {
        confirmDuplicates,
      })
      setPendingImport(null)
      setDuplicateImport(null)
      notifySuccess(`已导入 ${importedRecords.length} 条记录`, {
        voiceURI: successVoiceURI,
      })
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
      notifySuccess('文件上传成功', { voiceURI: successVoiceURI })
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
      notifySuccess('文件信息已更新', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件信息更新失败')
    }
  }

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id)
      notifySuccess('文件已删除', { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件删除失败')
    }
  }

  const handleDeleteAttachments = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteAttachment(id)))
      notifySuccess(`已删除 ${ids.length} 个文件`, { voiceURI: successVoiceURI })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量删除失败')
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
    <div className="min-h-screen bg-background" data-interface-style={event.interfaceStyle}>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <EventDetail
          event={event}
          records={getRecordsByEvent(event.id)}
          attachments={getAttachmentsByEvent(event.id)}
          statistics={getStatistics(event.id)}
          duplicateImport={duplicateImport}
          giftRecordColumns={giftRecordColumns}
          maskAmounts={maskAmounts}
          interfaceStyle={event.interfaceStyle}
          pdfCoverImageDataUrl={event.pdfCoverImageDataUrl ?? null}
          section={section}
          onBack={() =>
            section === 'overview'
              ? router.push('/')
              : router.push(`/events/${event.id}`)
          }
          onUpdateEvent={handleUpdateEvent}
          onAddRecord={handleAddRecord}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
          onDeleteRecords={handleDeleteRecords}
          onUpdateGiftRecordColumns={handleUpdateGiftRecordColumns}
          onMaskAmountsChange={handleMaskAmountsChange}
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
          onDeleteAttachments={handleDeleteAttachments}
        />
      </main>
    </div>
  )
}
