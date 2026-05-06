'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { GiftRecord } from '@/lib/types'

interface RecordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  record?: GiftRecord | null
  onSubmit: (data: Omit<GiftRecord, 'id' | 'createdAt'>) => Promise<void>
}

const QUICK_AMOUNTS = [200, 500, 600, 800, 1000, 1200, 1600, 2000]

export function RecordFormDialog({ open, onOpenChange, eventId, record, onSubmit }: RecordFormDialogProps) {
  const [guestName, setGuestName] = useState('')
  const [amount, setAmount] = useState('')
  const [giftItem, setGiftItem] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (record) {
      setGuestName(record.guestName)
      setAmount(record.amount.toString())
      setGiftItem(record.giftItem)
      setDate(record.date)
      setNote(record.note || '')
    } else {
      setGuestName('')
      setAmount('')
      setGiftItem('')
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
    }
  }, [record, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      guestName,
      amount: parseFloat(amount),
      giftItem,
      date,
      eventId,
      note: note || undefined
    })
    onOpenChange(false)
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {record ? '编辑礼金记录' : '添加礼金记录'}
          </DialogTitle>
          <DialogDescription>
            {record ? '修改礼金记录信息' : '录入新的礼金往来记录'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">送礼人姓名 *</Label>
            <Input
              id="guestName"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="请输入姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金额（元）*</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入金额"
              min="0"
              step="1"
              required
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_AMOUNTS.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs hover:bg-primary/10 hover:text-primary hover:border-primary"
                  onClick={() => handleQuickAmount(value)}
                >
                  ¥{value}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="giftItem">礼品内容</Label>
            <Input
              id="giftItem"
              value={giftItem}
              onChange={(e) => setGiftItem(e.target.value)}
              placeholder="例如：现金、红包、礼品等"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日期 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">备注</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="其他备注信息..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {record ? '保存修改' : '添加记录'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
