'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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
  Edit,
  Settings,
  ChevronDown,
  ChevronRight,
  Files,
  UserRound
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Event, EventAttachment, GiftRecord, Statistics } from '@/lib/types'
import type { InterfaceStyle } from '@/lib/types'
import { EVENT_TYPE_ICONS } from '@/lib/types'
import type { GiftRecordColumnKey } from '@/lib/gift-record-columns.js'
import { AmountVisibilityToggle } from './amount-visibility-toggle'
import { StatisticsCards } from './statistics-cards'
import { RecordsTable } from './records-table'
import { RecordFormDialog } from './record-form-dialog'
import { EventLedgerWorkspace } from './event-ledger-workspace'
import { EventFormDialog } from './event-form-dialog'
import { exportToExcel, exportToPDF } from '@/lib/export'
import { getEventDetailSections } from '@/lib/event-detail-sections.js'
import { filesFromDataTransfer, filesFromFileList } from '@/lib/file-list.js'
import {
  PAGE_SIZE_OPTIONS,
  getPaginationState,
  paginateItems,
} from '@/lib/pagination.js'

interface EventDetailProps {
  event: Event
  records: GiftRecord[]
  attachments: EventAttachment[]
  statistics: Statistics
  duplicateImport?: { duplicateCount: number; totalCount: number } | null
  giftRecordColumns: GiftRecordColumnKey[]
  maskAmounts: boolean
  interfaceStyle: InterfaceStyle
  pdfCoverImageDataUrl: string | null
  section?: 'overview' | 'notes' | 'records'
  onBack: () => void
  onUpdateEvent: (data: Omit<Event, 'id' | 'createdAt'>) => Promise<void>
  onAddRecord: (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateRecord: (id: string, data: Partial<GiftRecord>) => Promise<void>
  onDeleteRecord: (id: string) => Promise<void>
  onDeleteRecords: (ids: string[]) => Promise<void>
  onUpdateGiftRecordColumns: (columns: GiftRecordColumnKey[]) => Promise<GiftRecordColumnKey[]>
  onMaskAmountsChange: (maskAmounts: boolean) => void
  onImportRecords: (eventId: string, file: File) => Promise<void>
  onConfirmImportDuplicates?: () => void
  onCancelImportDuplicates?: () => void
  onUploadAttachments: (eventId: string, files: File[]) => Promise<void>
  onUpdateAttachment: (
    id: string,
    data: Pick<EventAttachment, 'displayName' | 'note'>
  ) => Promise<void>
  onDeleteAttachment: (id: string) => Promise<void>
  onDeleteAttachments: (ids: string[]) => Promise<void>
}

export function EventDetail({ 
  event, 
  records, 
  attachments,
  statistics, 
  duplicateImport,
  giftRecordColumns,
  maskAmounts,
  interfaceStyle,
  pdfCoverImageDataUrl,
  section = 'overview',
  onBack,
  onUpdateEvent,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteRecords,
  onUpdateGiftRecordColumns,
  onMaskAmountsChange,
  onImportRecords,
  onConfirmImportDuplicates,
  onCancelImportDuplicates,
  onUploadAttachments,
  onUpdateAttachment,
  onDeleteAttachment,
  onDeleteAttachments
}: EventDetailProps) {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [eventSettingsOpen, setEventSettingsOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GiftRecord | null>(null)
  const [editingAttachment, setEditingAttachment] = useState<EventAttachment | null>(null)
  const [attachmentDisplayName, setAttachmentDisplayName] = useState('')
  const [attachmentNote, setAttachmentNote] = useState('')
  const [attachmentPage, setAttachmentPage] = useState(1)
  const [attachmentPageSize, setAttachmentPageSize] = useState(10)
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([])
  const [batchDeleteAttachmentsOpen, setBatchDeleteAttachmentsOpen] = useState(false)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(true)
  const [isAttachmentDragActive, setIsAttachmentDragActive] = useState(false)
  const [recordsExpanded, setRecordsExpanded] = useState(true)
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

  const uploadAttachmentFiles = async (files: File[]) => {
    if (files.length > 0) {
      await onUploadAttachments(event.id, files)
    }
  }

  const handleAttachmentChange = async (
    changeEvent: React.ChangeEvent<HTMLInputElement>
  ) => {
    await uploadAttachmentFiles(filesFromFileList(changeEvent.target.files))

    changeEvent.target.value = ''
  }

  const handleAttachmentDragOver = (dragEvent: React.DragEvent<HTMLDivElement>) => {
    dragEvent.preventDefault()
    dragEvent.dataTransfer.dropEffect = 'copy'
    setIsAttachmentDragActive(true)
  }

  const handleAttachmentDragLeave = (dragEvent: React.DragEvent<HTMLDivElement>) => {
    if (!dragEvent.currentTarget.contains(dragEvent.relatedTarget as Node | null)) {
      setIsAttachmentDragActive(false)
    }
  }

  const handleAttachmentDrop = async (dropEvent: React.DragEvent<HTMLDivElement>) => {
    dropEvent.preventDefault()
    setIsAttachmentDragActive(false)
    await uploadAttachmentFiles(filesFromDataTransfer(dropEvent.dataTransfer))
  }

  const handleExportPDF = async (selectedRecords = records) => {
    await exportToPDF(selectedRecords, event, {
      coverImageDataUrl: pdfCoverImageDataUrl,
      interfaceStyle,
    })
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
  const attachmentPagination = getPaginationState({
    totalItems: attachments.length,
    page: attachmentPage,
    pageSize: attachmentPageSize,
  })
  const paginatedAttachments = paginateItems(attachments, attachmentPagination)
  const currentPageAttachmentIds = paginatedAttachments.map((attachment) => attachment.id)
  const isCurrentAttachmentPageSelected =
    currentPageAttachmentIds.length > 0 &&
    currentPageAttachmentIds.every((id) => selectedAttachmentIds.includes(id))

  useEffect(() => {
    setSelectedAttachmentIds((ids) =>
      ids.filter((id) => attachments.some((attachment) => attachment.id === id))
    )
  }, [attachments])
  const {
    showWorkspace,
    showStatistics,
    showNotes,
    showRecords,
    showSectionLinks,
  } = getEventDetailSections(section)

  const handleAttachmentPageSelection = (checked: boolean) => {
    setSelectedAttachmentIds((ids) => {
      if (checked) {
        return Array.from(new Set([...ids, ...currentPageAttachmentIds]))
      }

      return ids.filter((id) => !currentPageAttachmentIds.includes(id))
    })
  }

  const handleAttachmentSelection = (id: string, checked: boolean) => {
    setSelectedAttachmentIds((ids) =>
      checked ? Array.from(new Set([...ids, id])) : ids.filter((item) => item !== id)
    )
  }

  const handleBatchDeleteAttachments = async () => {
    await onDeleteAttachments(selectedAttachmentIds)
    setSelectedAttachmentIds([])
    setBatchDeleteAttachmentsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                <span className="flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  记账人：{event.bookkeeperName || '-'}
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
        <AmountVisibilityToggle
          maskAmounts={maskAmounts}
          onMaskAmountsChange={onMaskAmountsChange}
        />
        <Button variant="outline" onClick={() => setEventSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          更多设置
        </Button>
      </div>

      {showWorkspace && (
        <>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelChange}
          />
          <EventLedgerWorkspace
            event={event}
            records={records}
            maskAmounts={maskAmounts}
            onAddRecord={onAddRecord}
            onEditRecord={handleEditRecord}
            onManageRecordsHref={`/events/${event.id}/records`}
            onImportExcel={() => excelInputRef.current?.click()}
            onExportExcel={() => exportToExcel(records, event)}
            onExportPDF={() => handleExportPDF()}
            visibleColumns={giftRecordColumns}
            onVisibleColumnsChange={onUpdateGiftRecordColumns}
            onDeleteRecord={onDeleteRecord}
            onDeleteRecords={onDeleteRecords}
            onExportSelectedExcel={(selectedRecords) =>
              exportToExcel(selectedRecords, event)
            }
            onExportSelectedPDF={handleExportPDF}
          />
        </>
      )}

      {showStatistics && (
        <>
          <StatisticsCards statistics={statistics} maskAmounts={maskAmounts} />
        </>
      )}

      {showNotes && (
      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-expanded={attachmentsExpanded}
                aria-label={attachmentsExpanded ? '折叠活动手记' : '展开活动手记'}
                onClick={() => setAttachmentsExpanded((value) => !value)}
              >
                {attachmentsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <CardTitle className="text-lg">活动手记</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {showSectionLinks && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/events/${event.id}/notes`}>查看全部</Link>
                </Button>
              )}
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
                批量上传
              </Button>
            </div>
          </div>
        </CardHeader>
        {attachmentsExpanded && (
          <CardContent>
            <div
              className={[
                'mb-4 flex min-h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
                isAttachmentDragActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary/20 text-muted-foreground',
              ].join(' ')}
              onDragOver={handleAttachmentDragOver}
              onDragEnter={handleAttachmentDragOver}
              onDragLeave={handleAttachmentDragLeave}
              onDrop={handleAttachmentDrop}
            >
              <Files className="mb-3 h-8 w-8" />
              <p className="text-sm font-medium text-foreground">
                拖拽文件到这里上传
              </p>
              <p className="mt-1 text-xs">
                支持图片、文档、表格、压缩包等格式，单个文件不超过 20MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                选择多个文件
              </Button>
            </div>
            {attachments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无手记文件</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border bg-secondary/30 px-3 py-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isCurrentAttachmentPageSelected}
                      onChange={(event) =>
                        handleAttachmentPageSelection(event.target.checked)
                      }
                    />
                    选择当前页
                  </label>
                  {selectedAttachmentIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        已选择 {selectedAttachmentIds.length} 个文件
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setBatchDeleteAttachmentsOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        批量删除
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAttachmentIds([])}
                      >
                        清空选择
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paginatedAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="border rounded-lg p-3 space-y-3 bg-card"
                    >
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={selectedAttachmentIds.includes(attachment.id)}
                          onChange={(event) =>
                            handleAttachmentSelection(
                              attachment.id,
                              event.target.checked
                            )
                          }
                        />
                        选择
                      </label>
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
              </div>
            )}
            {attachments.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>每页</span>
                  <select
                    value={attachmentPagination.pageSize}
                    onChange={(event) => {
                      setAttachmentPageSize(Number(event.target.value))
                      setAttachmentPage(1)
                    }}
                    className="h-8 rounded-md border bg-background px-2 text-foreground"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span>条</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={attachmentPagination.page <= 1}
                    onClick={() =>
                      setAttachmentPage((value) => Math.max(1, value - 1))
                    }
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {attachmentPagination.page} / {attachmentPagination.pageCount}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      attachmentPagination.page >= attachmentPagination.pageCount
                    }
                    onClick={() =>
                      setAttachmentPage((value) =>
                        Math.min(attachmentPagination.pageCount, value + 1)
                      )
                    }
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      )}

      {showRecords && (
      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-expanded={recordsExpanded}
                aria-label={recordsExpanded ? '折叠礼金记录' : '展开礼金记录'}
                onClick={() => setRecordsExpanded((value) => !value)}
              >
                {recordsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <CardTitle className="text-lg">礼金记录</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {showSectionLinks && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/events/${event.id}/records`}>查看全部</Link>
                </Button>
              )}
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
                onClick={() => handleExportPDF()}
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
        {recordsExpanded && (
          <CardContent>
            <RecordsTable
              records={records}
              visibleColumns={giftRecordColumns}
              onVisibleColumnsChange={onUpdateGiftRecordColumns}
              maskAmounts={maskAmounts}
              onEdit={handleEditRecord}
              onDelete={onDeleteRecord}
              onDeleteMany={onDeleteRecords}
              onExportSelectedExcel={(selectedRecords) =>
                exportToExcel(selectedRecords, event)
              }
              onExportSelectedPDF={handleExportPDF}
            />
          </CardContent>
        )}
      </Card>
      )}

      <RecordFormDialog
        open={recordDialogOpen}
        onOpenChange={handleDialogClose}
        eventId={event.id}
        record={editingRecord}
        onSubmit={handleRecordSubmit}
      />

      <EventFormDialog
        open={eventSettingsOpen}
        onOpenChange={setEventSettingsOpen}
        event={event}
        onSubmit={onUpdateEvent}
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

      <Dialog
        open={batchDeleteAttachmentsOpen}
        onOpenChange={setBatchDeleteAttachmentsOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">确认批量删除</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              确定要删除选中的 {selectedAttachmentIds.length} 个手记文件吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBatchDeleteAttachmentsOpen(false)}
              >
                取消
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBatchDeleteAttachments}
              >
                删除
              </Button>
            </div>
          </div>
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
