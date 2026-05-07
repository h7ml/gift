'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface AmountVisibilityToggleProps {
  maskAmounts: boolean
  onMaskAmountsChange: (maskAmounts: boolean) => void
  disabled?: boolean
}

export function AmountVisibilityToggle({
  maskAmounts,
  onMaskAmountsChange,
  disabled = false,
}: AmountVisibilityToggleProps) {
  const Icon = maskAmounts ? EyeOff : Eye

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-secondary/30 px-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {maskAmounts ? '金额打码' : '金额明文'}
      </span>
      <Switch
        checked={maskAmounts}
        disabled={disabled}
        aria-label="切换金额打码"
        onCheckedChange={onMaskAmountsChange}
      />
    </div>
  )
}
