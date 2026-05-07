'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notifySuccess } from '@/lib/success-feedback.js'
import type { InterfaceStyle } from '@/lib/types'

interface MoreSettingsProps {
  interfaceStyle: InterfaceStyle
  successVoiceURI: string | null
  pdfCoverImageDataUrl: string | null
  onInterfaceStyleChange: (interfaceStyle: InterfaceStyle) => Promise<InterfaceStyle>
  onSuccessVoiceURIChange: (voiceURI: string | null) => Promise<string | null>
  onPdfCoverImageDataUrlChange: (dataUrl: string | null) => Promise<string | null>
  showActivitySettings?: boolean
}

export function MoreSettings({
  interfaceStyle,
  successVoiceURI,
  pdfCoverImageDataUrl,
  onInterfaceStyleChange,
  onSuccessVoiceURIChange,
  onPdfCoverImageDataUrlChange,
  showActivitySettings = true,
}: MoreSettingsProps) {
  const [open, setOpen] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const coverInputRef = useRef<HTMLInputElement>(null)
  const selectedVoiceValue = successVoiceURI ?? '__default__'

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())

    loadVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices)
    }
  }, [])

  const displayVoices = useMemo(
    () =>
      voices.filter((voice) =>
        voice.lang.toLowerCase().startsWith('zh')
      ),
    [voices]
  )

  const handleInterfaceStyleChange = async (value: string) => {
    try {
      await onInterfaceStyleChange(value === 'gray' ? 'gray' : 'red')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '界面风格保存失败')
    }
  }

  const handleVoiceChange = async (value: string) => {
    try {
      await onSuccessVoiceURIChange(value === '__default__' ? null : value)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '语音音色保存失败')
    }
  }

  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error('封面图仅支持 JPG/PNG，且不能超过 2MB')
      return
    }

    try {
      await onPdfCoverImageDataUrlChange(await readFileAsDataUrl(file))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '封面图保存失败')
    }
  }

  const handleClearCover = async () => {
    try {
      await onPdfCoverImageDataUrlChange(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '封面图清除失败')
    }
  }

  const handlePreviewVoice = () => {
    notifySuccess('添加成功', { voiceURI: successVoiceURI })
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex items-center gap-2 text-xl font-semibold text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        更多设置
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {open && (
        <Card className="border-primary/10">
          <CardContent className="space-y-6 pt-6">
            {showActivitySettings && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">新建活动默认风格</Label>
                <Select value={interfaceStyle} onValueChange={handleInterfaceStyleChange}>
                  <SelectTrigger className="h-12 w-full text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red">喜庆红（红事）</SelectItem>
                    <SelectItem value="gray">白事（肃穆灰）</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  新建活动时默认采用该风格，单个活动可在新建/编辑活动中单独调整。
                </p>
              </div>
            )}

            {showActivitySettings && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  默认礼簿(打印/导出PDF)封面图（可选）
                </Label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    选择文件
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {pdfCoverImageDataUrl ? '已选择封面图' : '未选择任何文件'}
                  </span>
                  {pdfCoverImageDataUrl && (
                    <Button type="button" variant="ghost" onClick={handleClearCover}>
                      移除
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  可作为新建活动时的默认封面图，单个活动可单独修改。
                </p>
                {pdfCoverImageDataUrl && (
                  <img
                    src={pdfCoverImageDataUrl}
                    alt="PDF封面图预览"
                    className="h-32 w-full max-w-md rounded-md border object-cover"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-base font-semibold">语音播报音色</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={selectedVoiceValue} onValueChange={handleVoiceChange}>
                  <SelectTrigger className="h-12 w-full text-base sm:flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">默认音色</SelectItem>
                    {displayVoices.map((voice) => (
                      <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={handlePreviewVoice}>
                  预览
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
