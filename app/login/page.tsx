'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth-shell'
import { useAuthStore } from '@/hooks/use-auth-store'
import { buildPageTitle } from '@/lib/page-title.js'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = buildPageTitle('登录')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || '登录失败')
    }

    setIsLoading(false)
  }

  return (
    <AuthShell
      title="欢迎回来"
      description="登录您的礼薄账号，继续管理活动与礼金记录。"
      switchText="还没有账号？"
      switchHref="/register"
      switchLabel="立即注册"
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        {error && (
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">邮箱地址</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              登录中...
            </>
          ) : (
            '登录'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
