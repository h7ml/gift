'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDisplayMoney } from '@/lib/money-display'
import type { Event, GiftRecord } from '@/lib/types'

interface EventLedgerWorkspaceProps {
  event: Event
  records: GiftRecord[]
  maskAmounts: boolean
  onAddRecord: (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

const PAGE_SIZE = 36
const PAYMENT_TYPES = ['现金', '支付宝', '微信', '其他']

export function EventLedgerWorkspace({
  event,
  records,
  maskAmounts,
  onAddRecord,
}: EventLedgerWorkspaceProps) {
  const [guestName, setGuestName] = useState('')
  const [amount, setAmount] = useState('')
  const [giftItem, setGiftItem] = useState(PAYMENT_TYPES[0])
  const [note, setNote] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const ledgerRef = useRef<HTMLDivElement>(null)

  const filteredRecords = useMemo(() => {
    const text = query.trim().toLowerCase()

    if (!text) {
      return records
    }

    return records.filter((record) =>
      [record.guestName, record.relativeTitle, record.phoneNumber, record.homeAddress, record.note]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text))
    )
  }, [query, records])

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRecords = filteredRecords.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )
  const currentPageAmount = pageRecords.reduce((sum, record) => sum + record.amount, 0)
  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0)
  const cells = Array.from({ length: PAGE_SIZE }, (_, index) => pageRecords[index])
  const ritualText = event.interfaceStyle === 'gray' ? '奠仪' : '贺礼'

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === ledgerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault()

    if (!guestName.trim() || !amount) {
      return
    }

    setIsSubmitting(true)

    try {
      await onAddRecord({
        guestName: guestName.trim(),
        amount: Number(amount),
        giftItem,
        date: new Date().toISOString().slice(0, 10),
        eventId: event.id,
        note: note.trim() || undefined,
      })
      setGuestName('')
      setAmount('')
      setGiftItem(PAYMENT_TYPES[0])
      setNote('')
      setPage(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFullscreenToggle = async () => {
    if (!ledgerRef.current) {
      return
    }

    if (document.fullscreenElement === ledgerRef.current) {
      await document.exitFullscreen()
      return
    }

    await ledgerRef.current.requestFullscreen()
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 border-r border-border/70 bg-card p-6 shadow-sm xl:min-h-[760px]"
      >
        <div className="border-b pb-5 text-center">
          <h2 className="text-3xl font-bold tracking-normal text-foreground">礼金录入</h2>
        </div>

        <div className="space-y-4">
          <Input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="姓名"
            className="h-14 text-lg"
            required
          />
          <Input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="金额（元）"
            className="h-14 text-lg"
            inputMode="decimal"
            type="number"
            min="0"
            step="1"
            required
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-foreground">收款类型</legend>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 text-base font-medium">
                <input
                  type="radio"
                  name="giftItem"
                  value={type}
                  checked={giftItem === type}
                  onChange={() => setGiftItem(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="备注（选填）"
          className="min-h-28 text-base"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-16 text-xl font-bold"
        >
          确认录入
        </Button>

        <div className="mt-4 border-t pt-5">
          <h3 className="mb-4 text-2xl font-bold">功能区</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="按姓名查找..."
              className="h-12 pl-10 text-base"
            />
          </div>
        </div>
      </form>

      <div
        ref={ledgerRef}
        className="min-w-0 overflow-auto border-l-[6px] border-r-[6px] border-primary bg-background p-4 sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-2xl font-bold">
            <span>
              本页小计:{' '}
              <strong className="text-primary">
                {formatDisplayMoney(currentPageAmount, maskAmounts)}
              </strong>
            </span>
            <span>
              总金额:{' '}
              <strong className="text-primary">
                {formatDisplayMoney(totalAmount, maskAmounts)}
              </strong>
            </span>
            <span>
              总人数: <strong className="text-primary">{filteredRecords.length}</strong>
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={safePage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="上一页"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 text-2xl font-bold">
              第
              <span className="rounded-md border bg-background px-3 py-1">
                {safePage}
              </span>
              / {pageCount} 页
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
              disabled={safePage >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              aria-label="下一页"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              aria-label={isFullscreen ? '退出全屏' : '全屏查看'}
              onClick={handleFullscreenToggle}
            >
              <Maximize2 className="h-6 w-6 text-primary" />
            </Button>
          </div>
        </div>

        <div className="grid min-h-[680px] grid-cols-6 border-l border-t border-primary/30 bg-background md:grid-cols-9 xl:grid-cols-12">
          {cells.map((record, index) => {
            const isTitleRow = index >= 12 && index < 24

            return (
              <div
                key={record?.id ?? `empty-${index}`}
                className="relative flex min-h-40 flex-col items-center justify-center gap-2 border-b border-r border-primary/30 px-2 py-4 text-center"
              >
                {isTitleRow && !record ? (
                  <VerticalText className="text-2xl font-bold text-primary">
                    {ritualText}
                  </VerticalText>
                ) : record ? (
                  <>
                    <VerticalText className="text-lg font-bold text-foreground">
                      {record.guestName}
                    </VerticalText>
                    <span className="text-sm font-semibold text-primary">
                      {formatDisplayMoney(record.amount, maskAmounts)}
                    </span>
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VerticalText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <span
      className={className}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
        letterSpacing: '0',
      }}
    >
      {children}
    </span>
  )
}
