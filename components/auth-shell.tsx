'use client'

import Link from 'next/link'
import { BookOpen, FileSpreadsheet, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AuthShellProps {
  title: string
  description: string
  switchText: string
  switchHref: string
  switchLabel: string
  children: React.ReactNode
}

export function AuthShell({
  title,
  description,
  switchText,
  switchHref,
  switchLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">
        <section className="hidden bg-secondary/40 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-semibold text-primary">中国礼薄</p>
              <p className="text-xs text-muted-foreground">礼尚往来 · 情谊永存</p>
            </div>
          </Link>

          <div className="max-w-xl space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary">礼金记录管理</p>
              <h1 className="max-w-lg text-4xl font-semibold leading-tight text-foreground">
                把每一份往来记录清楚，也把每一次情分留住。
              </h1>
              <p className="max-w-md text-base leading-7 text-muted-foreground">
                活动、礼金、手记、导入导出和权限协作集中管理，适合家庭和团队共同记账。
              </p>
            </div>

            <div className="grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-md border bg-card/70 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">权限协作</p>
                <p className="mt-1 text-sm text-muted-foreground">按活动分配成员角色</p>
              </div>
              <div className="rounded-md border bg-card/70 p-4">
                <FileSpreadsheet className="mb-3 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">导入导出</p>
                <p className="mt-1 text-sm text-muted-foreground">支持 Excel 与 PDF 礼簿</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            传统礼簿体验，现代化数据管理。
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-primary">中国礼薄</span>
              </Link>
            </div>

            <Card className="border-primary/15 shadow-xl">
              <div className="border-b px-6 py-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
              {children}
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              {switchText}{' '}
              <Link href={switchHref} className="font-medium text-primary hover:underline">
                {switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
