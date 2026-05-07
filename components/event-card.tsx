'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Calendar, MapPin, Trash2, Edit, FileSpreadsheet, FileText, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Event, GiftRecord } from '@/lib/types'
import { EVENT_TYPE_ICONS } from '@/lib/types'
import { exportToExcel, exportToPDF } from '@/lib/export'
import { formatDisplayMoney } from '@/lib/money-display'

interface EventCardProps {
  event: Event
  records: GiftRecord[]
  selected: boolean
  maskAmounts?: boolean
  onSelectChange: (checked: boolean) => void
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function EventCard({
  event,
  records,
  selected,
  maskAmounts = false,
  onSelectChange,
  onSelect,
  onEdit,
  onDelete,
}: EventCardProps) {
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  const icon = EVENT_TYPE_ICONS[event.type]

  const handleExportExcel = (e: React.MouseEvent) => {
    e.stopPropagation()
    exportToExcel(records, event)
  }

  const handleExportPDF = (e: React.MouseEvent) => {
    e.stopPropagation()
    exportToPDF(records, event)
  }

  return (
    <Card 
      className="border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected}
              aria-label={`选择 ${event.name}`}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onSelectChange(e.target.checked)}
            />
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {event.name}
              </h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {event.type}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <Edit className="h-4 w-4 mr-2" />
                编辑活动
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel} disabled={records.length === 0}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                导出 Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} disabled={records.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                导出 PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除活动
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.date), 'yyyy年MM月dd日', { locale: zhCN })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="h-4 w-4" />
            <span>记账人：{event.bookkeeperName || '-'}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="pt-3 border-t border-border mt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">共</span>
                <span className="text-lg font-semibold text-foreground mx-1">{records.length}</span>
                <span className="text-sm text-muted-foreground">人</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">合计</span>
                <span className="text-xl font-bold text-primary ml-2">
                  {formatDisplayMoney(totalAmount, maskAmounts)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
