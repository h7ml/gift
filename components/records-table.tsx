'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreVertical, Edit, Trash2, Search, ArrowUpDown, Columns3 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { GiftRecord } from '@/lib/types'

interface RecordsTableProps {
  records: GiftRecord[]
  onEdit: (record: GiftRecord) => void
  onDelete: (id: string) => Promise<void>
}

type SortField = 'guestName' | 'amount' | 'date' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'
type ColumnKey =
  | 'guestName'
  | 'relativeTitle'
  | 'amount'
  | 'giftItem'
  | 'date'
  | 'note'
  | 'createdAt'
  | 'updatedAt'

const RECORD_COLUMNS: Array<{
  key: ColumnKey
  label: string
  sortable?: boolean
  render: (record: GiftRecord) => ReactNode
}> = [
  {
    key: 'guestName',
    label: '姓名',
    sortable: true,
    render: (record) => <span className="font-medium">{record.guestName}</span>,
  },
  {
    key: 'relativeTitle',
    label: '亲戚称谓',
    render: (record) => record.relativeTitle || '-',
  },
  {
    key: 'amount',
    label: '金额',
    sortable: true,
    render: (record) => (
      <span className="text-primary font-semibold">
        ¥{record.amount.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'giftItem',
    label: '礼品',
    render: (record) => record.giftItem || '-',
  },
  {
    key: 'date',
    label: '日期',
    sortable: true,
    render: (record) => format(new Date(record.date), 'MM月dd日', { locale: zhCN }),
  },
  {
    key: 'note',
    label: '备注',
    render: (record) => record.note || '-',
  },
  {
    key: 'createdAt',
    label: '录入时间',
    sortable: true,
    render: (record) => format(new Date(record.createdAt), 'MM-dd HH:mm'),
  },
  {
    key: 'updatedAt',
    label: '更新时间',
    sortable: true,
    render: (record) => format(new Date(record.updatedAt), 'MM-dd HH:mm'),
  },
]

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = ['guestName', 'amount']

export function RecordsTable({ records, onEdit, onDelete }: RecordsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
    DEFAULT_VISIBLE_COLUMNS
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedRecords = records
    .filter(record => 
      record.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.relativeTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.giftItem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.note?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'guestName':
          comparison = a.guestName.localeCompare(b.guestName, 'zh-CN')
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  const activeColumns = RECORD_COLUMNS.filter((column) =>
    visibleColumns.includes(column.key)
  )

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">暂无礼金记录</p>
        <p className="text-sm mt-1">点击上方按钮添加第一条记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名、礼品或备注..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="hidden sm:flex">
          共 {filteredAndSortedRecords.length} 条记录
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="h-4 w-4 mr-2" />
              列
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {RECORD_COLUMNS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={(checked) => {
                  setVisibleColumns((prev) => {
                    if (checked) {
                      return prev.includes(column.key) ? prev : [...prev, column.key]
                    }

                    if (prev.length === 1) {
                      return prev
                    }

                    return prev.filter((key) => key !== column.key)
                  })
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-[50px] text-center">#</TableHead>
              {activeColumns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8"
                      onClick={() => handleSort(column.key as SortField)}
                    >
                      {column.label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRecords.map((record, index) => (
              <TableRow key={record.id} className="hover:bg-secondary/30">
                <TableCell className="text-center text-muted-foreground">
                  {index + 1}
                </TableCell>
                {activeColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="text-muted-foreground truncate max-w-[180px]"
                  >
                    {column.render(record)}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(record.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条礼金记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
