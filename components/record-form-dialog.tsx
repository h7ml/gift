'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatChineseMoney } from '@/lib/chinese-money.js'
import type { GiftRecord } from '@/lib/types'

interface RecordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  record?: GiftRecord | null
  onSubmit: (data: Omit<GiftRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

const QUICK_AMOUNTS = [100,200,300, 500, 600, 800, 1000, 1200, 1600, 2000]

export function RecordFormDialog({ open, onOpenChange, eventId, record, onSubmit }: RecordFormDialogProps) {
  const [guestName, setGuestName] = useState('')
  const [relativeTitle, setRelativeTitle] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [giftItem, setGiftItem] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (record) {
      setGuestName(record.guestName)
      setRelativeTitle(record.relativeTitle || '')
      setPhoneNumber(record.phoneNumber || '')
      setHomeAddress(record.homeAddress || '')
      setAmount(record.amount.toString())
      setGiftItem(record.giftItem)
      setDate(record.date)
      setNote(record.note || '')
    } else {
      setGuestName('')
      setRelativeTitle('')
      setPhoneNumber('')
      setHomeAddress('')
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
      relativeTitle: relativeTitle || undefined,
      phoneNumber: phoneNumber || undefined,
      homeAddress: homeAddress || undefined,
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
  const amountUppercase = formatChineseMoney(Number(amount))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-primary">
            {record ? '编辑礼金记录' : '添加礼金记录'}
          </SheetTitle>
          <SheetDescription>
            {record ? '修改礼金记录信息' : '录入新的礼金往来记录'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
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
              <Label htmlFor="relativeTitle">亲戚称谓</Label>
              <Input
                id="relativeTitle"
                value={relativeTitle}
                onChange={(e) => setRelativeTitle(e.target.value)}
                placeholder="例如：表哥、舅舅、同事"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">联系电话</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="请输入联系电话"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeAddress">住宅地址</Label>
              <Input
                id="homeAddress"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="请输入住宅地址"
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
              {amountUppercase && (
                <p className="text-xs text-muted-foreground">
                  大写金额：{amountUppercase}
                </p>
              )}
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
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {record ? '保存修改' : '添加记录'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
