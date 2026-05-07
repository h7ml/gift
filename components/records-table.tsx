'use client'

import { useEffect, useState } from 'react'
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
import { MoreVertical, Edit, Trash2, Search, ArrowUpDown, Columns3, FileSpreadsheet, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  formatDisplayChineseMoney,
  formatDisplayMoney,
} from '@/lib/money-display'
import type { GiftRecord } from '@/lib/types'
import {
  DEFAULT_GIFT_RECORD_COLUMNS,
  GIFT_RECORD_COLUMN_KEYS,
  type GiftRecordColumnKey,
} from '@/lib/gift-record-columns.js'
import {
  PAGE_SIZE_OPTIONS,
  getPaginationState,
  paginateItems,
} from '@/lib/pagination.js'
import { filterGiftRecordsBySearchQuery } from '@/lib/gift-record-search.js'

interface RecordsTableProps {
  records: GiftRecord[]
  onEdit: (record: GiftRecord) => void
  onDelete: (id: string) => Promise<void>
  onDeleteMany: (ids: string[]) => Promise<void>
  onExportSelectedExcel: (records: GiftRecord[]) => void
  onExportSelectedPDF: (records: GiftRecord[]) => void
  maskAmounts?: boolean
}

type SortField = 'guestName' | 'amount' | 'date' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'
type ColumnKey = GiftRecordColumnKey

const RECORD_COLUMNS: Array<{
  key: ColumnKey
  label: string
  sortable?: boolean
  render: (record: GiftRecord, maskAmounts: boolean) => ReactNode
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
    key: 'phoneNumber',
    label: '联系电话',
    render: (record) => record.phoneNumber || '-',
  },
  {
    key: 'homeAddress',
    label: '住宅地址',
    render: (record) => record.homeAddress || '-',
  },
  {
    key: 'amount',
    label: '金额',
    sortable: true,
    render: (record, maskAmounts) => (
      <span className="text-primary font-semibold">
        {formatDisplayMoney(record.amount, maskAmounts)}
      </span>
    ),
  },
  {
    key: 'amountUppercase',
    label: '金额大写',
    render: (record, maskAmounts) =>
      formatDisplayChineseMoney(record.amount, maskAmounts),
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

export function RecordsTable({
  records,
  visibleColumns,
  onVisibleColumnsChange,
  onEdit,
  onDelete,
  onDeleteMany,
  onExportSelectedExcel,
  onExportSelectedPDF,
  maskAmounts = false,
}: RecordsTableProps & {
  visibleColumns: ColumnKey[]
  onVisibleColumnsChange: (columns: ColumnKey[]) => Promise<ColumnKey[]>
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isSavingColumns, setIsSavingColumns] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedRecords = filterGiftRecordsBySearchQuery(records, searchQuery)
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
  const pagination = getPaginationState({
    totalItems: filteredAndSortedRecords.length,
    page,
    pageSize,
  })
  const paginatedRecords = paginateItems(filteredAndSortedRecords, pagination)
  const selectedRecords = records.filter((record) => selectedIds.includes(record.id))
  const currentPageIds = paginatedRecords.map((record) => record.id)
  const isCurrentPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id))

  useEffect(() => {
    setSelectedIds((ids) =>
      ids.filter((id) => records.some((record) => record.id === id))
    )
  }, [records])

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const handleConfirmBatchDelete = async () => {
    await onDeleteMany(selectedIds)
    setSelectedIds([])
    setBatchDeleteOpen(false)
  }

  const handleCurrentPageSelection = (checked: boolean) => {
    setSelectedIds((ids) => {
      if (checked) {
        return Array.from(new Set([...ids, ...currentPageIds]))
      }

      return ids.filter((id) => !currentPageIds.includes(id))
    })
  }

  const handleRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((ids) =>
      checked ? Array.from(new Set([...ids, id])) : ids.filter((item) => item !== id)
    )
  }

  const handleVisibleColumnsChange = async (columns: ColumnKey[]) => {
    setIsSavingColumns(true)

    try {
      await onVisibleColumnsChange(columns)
    } finally {
      setIsSavingColumns(false)
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
            placeholder="搜索姓名、电话、地址、金额或金额段..."
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
                  const nextColumns = (() => {
                    if (checked) {
                      return visibleColumns.includes(column.key)
                        ? visibleColumns
                        : [...visibleColumns, column.key]
                    }

                    if (visibleColumns.length === 1) {
                      return visibleColumns
                    }

                    return visibleColumns.filter((key) => key !== column.key)
                  })()

                  handleVisibleColumnsChange(nextColumns)
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuItem
              disabled={isSavingColumns}
              onClick={() => handleVisibleColumnsChange(DEFAULT_GIFT_RECORD_COLUMNS)}
            >
              一键默认
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isSavingColumns}
              onClick={() => handleVisibleColumnsChange(GIFT_RECORD_COLUMN_KEYS)}
            >
              一键全部
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-secondary/30 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            已选择 {selectedIds.length} 条记录
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportSelectedExcel(selectedRecords)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              导出 Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportSelectedPDF(selectedRecords)}
            >
              <FileText className="h-4 w-4 mr-2" />
              导出 PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setBatchDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              清空选择
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-[44px] text-center">
                <input
                  type="checkbox"
                  checked={isCurrentPageSelected}
                  aria-label="选择当前页记录"
                  onChange={(event) =>
                    handleCurrentPageSelection(event.target.checked)
                  }
                />
              </TableHead>
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
            {paginatedRecords.map((record, index) => (
              <TableRow key={record.id} className="hover:bg-secondary/30">
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record.id)}
                    aria-label={`选择 ${record.guestName}`}
                    onChange={(event) =>
                      handleRowSelection(record.id, event.target.checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {(pagination.page - 1) * pagination.pageSize + index + 1}
                </TableCell>
                {activeColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="text-muted-foreground truncate max-w-[180px]"
                  >
                    {column.render(record, maskAmounts)}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页</span>
          <select
            value={pagination.pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
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
            disabled={pagination.page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pageCount}
            onClick={() =>
              setPage((value) => Math.min(pagination.pageCount, value + 1))
            }
          >
            下一页
          </Button>
        </div>
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

      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedIds.length} 条礼金记录吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBatchDelete}
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
