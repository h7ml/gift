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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { EVENT_TYPES, EVENT_TYPE_ICONS } from '@/lib/types'
import type { Event, EventType, InterfaceStyle } from '@/lib/types'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
  defaultInterfaceStyle?: InterfaceStyle
  defaultPdfCoverImageDataUrl?: string | null
  onSubmit: (data: Omit<Event, 'id' | 'createdAt'>) => Promise<void>
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  defaultInterfaceStyle = 'red',
  defaultPdfCoverImageDataUrl = null,
  onSubmit,
}: EventFormDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<EventType>('婚礼')
  const [date, setDate] = useState('')
  const [bookkeeperName, setBookkeeperName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [interfaceStyle, setInterfaceStyle] =
    useState<InterfaceStyle>(defaultInterfaceStyle)
  const [pdfCoverImageDataUrl, setPdfCoverImageDataUrl] = useState('')

  useEffect(() => {
    if (event) {
      setName(event.name)
      setType(event.type)
      setDate(event.date)
      setBookkeeperName(event.bookkeeperName)
      setLocation(event.location || '')
      setDescription(event.description || '')
      setInterfaceStyle(event.interfaceStyle)
      setPdfCoverImageDataUrl(event.pdfCoverImageDataUrl || '')
    } else {
      setName('')
      setType('婚礼')
      setDate(new Date().toISOString().split('T')[0])
      setBookkeeperName('')
      setLocation('')
      setDescription('')
      setInterfaceStyle(defaultInterfaceStyle)
      setPdfCoverImageDataUrl(defaultPdfCoverImageDataUrl || '')
    }
  }, [defaultInterfaceStyle, defaultPdfCoverImageDataUrl, event, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      type,
      date,
      bookkeeperName,
      location: location || undefined,
      description: description || undefined,
      interfaceStyle,
      pdfCoverImageDataUrl: pdfCoverImageDataUrl || undefined,
    })
    onOpenChange(false)
  }

  const handleCoverChange = async (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const file = changeEvent.target.files?.[0]
    changeEvent.target.value = ''

    if (!file) {
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('封面图仅支持 JPG 或 PNG')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('封面图大小不能超过 2MB')
      return
    }

    setPdfCoverImageDataUrl(await readFileAsDataUrl(file))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-primary">
            {event ? '编辑活动' : '新建活动'}
          </SheetTitle>
          <SheetDescription>
            {event ? '修改活动的基本信息' : '创建一个新的礼金记录活动'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
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

            <div className="space-y-2">
              <Label htmlFor="interfaceStyle">界面风格 *</Label>
              <Select
                value={interfaceStyle}
                onValueChange={(value) =>
                  setInterfaceStyle(value === 'gray' ? 'gray' : 'red')
                }
              >
                <SelectTrigger id="interfaceStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">喜庆红（红事）</SelectItem>
                  <SelectItem value="gray">白事（肃穆灰）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfCoverImage">PDF封面图</Label>
              <Input
                id="pdfCoverImage"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverChange}
              />
              <p className="text-xs text-muted-foreground">
                可选，JPG/PNG，大小不超过 2MB。
              </p>
              {pdfCoverImageDataUrl && (
                <div className="space-y-2">
                  <img
                    src={pdfCoverImageDataUrl}
                    alt="PDF封面图预览"
                    className="h-28 w-full rounded-md border object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPdfCoverImageDataUrl('')}
                  >
                    移除封面图
                  </Button>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {event ? '保存修改' : '创建活动'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('封面图读取失败'))
    reader.readAsDataURL(file)
  })
}
