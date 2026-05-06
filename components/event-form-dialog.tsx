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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EVENT_TYPES, EVENT_TYPE_ICONS } from '@/lib/types'
import type { Event, EventType } from '@/lib/types'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
  onSubmit: (data: Omit<Event, 'id' | 'createdAt'>) => Promise<void>
}

export function EventFormDialog({ open, onOpenChange, event, onSubmit }: EventFormDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<EventType>('婚礼')
  const [date, setDate] = useState('')
  const [bookkeeperName, setBookkeeperName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (event) {
      setName(event.name)
      setType(event.type)
      setDate(event.date)
      setBookkeeperName(event.bookkeeperName)
      setLocation(event.location || '')
      setDescription(event.description || '')
    } else {
      setName('')
      setType('婚礼')
      setDate(new Date().toISOString().split('T')[0])
      setBookkeeperName('')
      setLocation('')
      setDescription('')
    }
  }, [event, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      type,
      date,
      bookkeeperName,
      location: location || undefined,
      description: description || undefined
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {event ? '编辑活动' : '新建活动'}
          </DialogTitle>
          <DialogDescription>
            {event ? '修改活动的基本信息' : '创建一个新的礼金记录活动'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">活动名称 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：王明 & 李华 婚礼"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">活动类型 *</Label>
            <Select value={type} onValueChange={(v) => setType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <span>{EVENT_TYPE_ICONS[t]}</span>
                      <span>{t}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">活动日期 *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookkeeperName">记账人 *</Label>
            <Input
              id="bookkeeperName"
              value={bookkeeperName}
              onChange={(e) => setBookkeeperName(e.target.value)}
              placeholder="请输入本活动记账人"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">活动地点</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例如：北京饭店"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">备注说明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="其他需要记录的信息..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {event ? '保存修改' : '创建活动'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
