import Link from 'next/link'
import { ArrowLeft, BookOpen, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <section className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold text-primary">中国礼薄</p>
                <p className="text-xs text-muted-foreground">礼尚往来 · 情谊永存</p>
              </div>
            </Link>

            <div className="space-y-4">
              <p className="text-sm font-medium text-primary">404</p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-foreground">
                这个页面不存在，或你没有访问权限。
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                可能是活动链接已变更、记录已删除，或当前账号无法查看对应活动。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  返回活动列表
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4" />
                  重新登录
                </Link>
              </Button>
            </div>
          </section>

          <Card className="border-primary/15 bg-secondary/40 p-6">
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">建议检查</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>确认活动链接是否完整。</p>
                  <p>确认当前账号是否已加入该活动。</p>
                  <p>返回活动列表重新进入目标页面。</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
