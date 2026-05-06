'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MapPin, 
  FileSpreadsheet, 
  FileText,
  Camera,
  Upload,
  Download,
  Trash2,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Event, EventAttachment, GiftRecord, Statistics } from '@/lib/types'
import { EVENT_TYPE_ICONS } from '@/lib/types'
import { StatisticsCards } from './statistics-cards'
import { RecordsTable } from './records-table'
import { RecordFormDialog } from './record-form-dialog'
import { exportToExcel, exportToPDF } from '@/lib/export'

interface EventDetailProps {
  event: Event
  records: GiftRecord[]
  attachments: EventAttachment[]
  statistics: Statistics
  duplicateImport?: { duplicateCount: number; totalCount: number } | null
  onBack: () => void
  onAddRecord: (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateRecord: (id: string, data: Partial<GiftRecord>) => Promise<void>
  onDeleteRecord: (id: string) => Promise<void>
  onImportRecords: (eventId: string, file: File) => Promise<void>
  onConfirmImportDuplicates?: () => void
  onCancelImportDuplicates?: () => void
  onUploadAttachments: (eventId: string, files: File[]) => Promise<void>
  onUpdateAttachment: (
    id: string,
    data: Pick<EventAttachment, 'displayName' | 'note'>
  ) => Promise<void>
  onDeleteAttachment: (id: string) => Promise<void>
}

export function EventDetail({ 
  event, 
  records, 
  attachments,
  statistics, 
  duplicateImport,
  onBack,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onImportRecords,
  onConfirmImportDuplicates,
  onCancelImportDuplicates,
  onUploadAttachments,
  onUpdateAttachment,
  onDeleteAttachment
}: EventDetailProps) {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GiftRecord | null>(null)
  const [editingAttachment, setEditingAttachment] = useState<EventAttachment | null>(null)
  const [attachmentDisplayName, setAttachmentDisplayName] = useState('')
  const [attachmentNote, setAttachmentNote] = useState('')
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const excelInputRef = useRef<HTMLInputElement>(null)

  const handleEditRecord = (record: GiftRecord) => {
    setEditingRecord(record)
    setRecordDialogOpen(true)
  }

  const handleRecordSubmit = async (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRecord) {
      await onUpdateRecord(editingRecord.id, data)
    } else {
      await onAddRecord(data)
    }
    setEditingRecord(null)
  }

  const handleDialogClose = (open: boolean) => {
    setRecordDialogOpen(open)
    if (!open) {
      setEditingRecord(null)
    }
  }

  const handleAttachmentChange = async (
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(changeEvent.target.files ?? [])

    if (files.length > 0) {
      await onUploadAttachments(event.id, files)
    }

    changeEvent.target.value = ''
  }

  const handleExcelChange = async (
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = changeEvent.target.files?.[0]

    if (file) {
      await onImportRecords(event.id, file)
    }

    changeEvent.target.value = ''
  }

  const handleEditAttachment = (attachment: EventAttachment) => {
    setEditingAttachment(attachment)
    setAttachmentDisplayName(attachment.displayName || attachment.originalName)
    setAttachmentNote(attachment.note || '')
  }

  const handleAttachmentSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault()

    if (!editingAttachment) {
      return
    }

    await onUpdateAttachment(editingAttachment.id, {
      displayName: attachmentDisplayName,
      note: attachmentNote,
    })
    setEditingAttachment(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{EVENT_TYPE_ICONS[event.type]}</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{event.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <Badge variant="secondary">{event.type}</Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(event.date), 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
                {event.location && (
                  <span className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatisticsCards statistics={statistics} />

      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">活动手记</CardTitle>
            <div className="flex flex-wrap gap-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAttachmentChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachmentChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                拍照
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无手记文件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="border rounded-lg p-3 space-y-3 bg-card"
                >
                  {attachment.mimeType.startsWith('image/') && (
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      <img
                        src={attachment.url}
                        alt={attachment.originalName}
                        className="w-full aspect-video object-cover rounded-md border"
                      />
                    </a>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {attachment.displayName || attachment.originalName}
                    </p>
                    {attachment.note && (
                      <p className="text-xs text-muted-foreground truncate">
                        {attachment.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.sizeBytes)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={attachment.url} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        查看
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAttachment(attachment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">礼金记录</CardTitle>
            <div className="flex flex-wrap gap-2">
              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleExcelChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => excelInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                导入 Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToExcel(records, event)}
                disabled={records.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                导出 Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToPDF(records, event)}
                disabled={records.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                导出 PDF
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => setRecordDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加记录
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable
            records={records}
            onEdit={handleEditRecord}
            onDelete={onDeleteRecord}
          />
        </CardContent>
      </Card>

      <RecordFormDialog
        open={recordDialogOpen}
        onOpenChange={handleDialogClose}
        eventId={event.id}
        record={editingRecord}
        onSubmit={handleRecordSubmit}
      />

      <Dialog
        open={!!editingAttachment}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAttachment(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">编辑手记文件</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttachmentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attachmentName">文件名</Label>
              <Input
                id="attachmentName"
                value={attachmentDisplayName}
                onChange={(e) => setAttachmentDisplayName(e.target.value)}
                placeholder="输入显示文件名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attachmentNote">备注</Label>
              <Textarea
                id="attachmentNote"
                value={attachmentNote}
                onChange={(e) => setAttachmentNote(e.target.value)}
                placeholder="输入文件备注"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingAttachment(null)}
              >
                取消
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                保存
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!duplicateImport} onOpenChange={(open) => {
        if (!open) {
          onCancelImportDuplicates?.()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">发现重复记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              本次 Excel 共 {duplicateImport?.totalCount ?? 0} 条记录，其中{' '}
              {duplicateImport?.duplicateCount ?? 0} 条可能已存在。确认后仍会全部导入。
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onCancelImportDuplicates}>
                取消
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={onConfirmImportDuplicates}
              >
                继续导入
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
}
