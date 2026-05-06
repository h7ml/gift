'use client'

import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateEvent: () => void
}

export function EmptyState({ onCreateEvent }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">欢迎使用中国礼薄</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        记录人情往来，传承中华礼仪。开始创建您的第一个活动，记录每一份珍贵的心意。
      </p>
      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary/90"
        onClick={onCreateEvent}
      >
        <Plus className="h-5 w-5 mr-2" />
        创建第一个活动
      </Button>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center max-w-2xl">
        <div className="p-4">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-medium text-foreground">便捷记录</h3>
          <p className="text-sm text-muted-foreground mt-1">快速录入礼金信息</p>
        </div>
        <div className="p-4">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-medium text-foreground">智能统计</h3>
          <p className="text-sm text-muted-foreground mt-1">自动计算总额与人数</p>
        </div>
        <div className="p-4">
          <div className="text-3xl mb-2">📤</div>
          <h3 className="font-medium text-foreground">导出打印</h3>
          <p className="text-sm text-muted-foreground mt-1">支持 Excel 与 PDF</p>
        </div>
      </div>
    </div>
  )
}
