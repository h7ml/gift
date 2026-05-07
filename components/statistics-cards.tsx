'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, Wallet, TrendingUp, Award } from 'lucide-react'
import { formatDisplayMoney } from '@/lib/money-display'
import type { Statistics } from '@/lib/types'

interface StatisticsCardsProps {
  statistics: Statistics
  maskAmounts?: boolean
}

export function StatisticsCards({
  statistics,
  maskAmounts = false,
}: StatisticsCardsProps) {
  const stats = [
    {
      label: '总金额',
      value: formatDisplayMoney(statistics.totalAmount, maskAmounts),
      icon: Wallet,
      color: 'text-primary'
    },
    {
      label: '总人数',
      value: `${statistics.totalGuests} 人`,
      icon: Users,
      color: 'text-accent-foreground'
    },
    {
      label: '人均礼金',
      value: formatDisplayMoney(statistics.averageAmount, maskAmounts),
      icon: TrendingUp,
      color: 'text-muted-foreground'
    },
    {
      label: '最高礼金',
      value: formatDisplayMoney(statistics.maxAmount, maskAmounts),
      icon: Award,
      color: 'text-primary'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-primary/10 bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-xl font-semibold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
