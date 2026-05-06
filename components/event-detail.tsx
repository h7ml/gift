'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MapPin, 
  FileSpreadsheet, 
  FileText 
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Event, GiftRecord, Statistics } from '@/lib/types'
import { EVENT_TYPE_ICONS } from '@/lib/types'
import { StatisticsCards } from './statistics-cards'
import { RecordsTable } from './records-table'
import { RecordFormDialog } from './record-form-dialog'
import { exportToExcel, exportToPDF } from '@/lib/export'

interface EventDetailProps {
  event: Event
  records: GiftRecord[]
  statistics: Statistics
  onBack: () => void
  onAddRecord: (data: Omit<GiftRecord, 'id' | 'createdAt'>) => Promise<void>
  onUpdateRecord: (id: string, data: Partial<GiftRecord>) => Promise<void>
  onDeleteRecord: (id: string) => Promise<void>
}

export function EventDetail({ 
  event, 
  records, 
  statistics, 
  onBack,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord
}: EventDetailProps) {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GiftRecord | null>(null)

  const handleEditRecord = (record: GiftRecord) => {
    setEditingRecord(record)
    setRecordDialogOpen(true)
  }

  const handleRecordSubmit = async (data: Omit<GiftRecord, 'id' | 'createdAt'>) => {
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
            <CardTitle className="text-lg">礼金记录</CardTitle>
            <div className="flex flex-wrap gap-2">
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
    </div>
  )
}
