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

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = buildPageTitle('注册')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsLoading(true)

    const result = await signUp(email, password, name)

    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || '注册失败')
    }

    setIsLoading(false)
  }

  return (
    <AuthShell
      title="创建账号"
      description="注册后即可创建活动、录入礼金并导出礼簿。"
      switchText="已有账号？"
      switchHref="/login"
      switchLabel="立即登录"
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        {error && (
          <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            type="text"
            placeholder="您的姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11"
          />
        </div>

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
            placeholder="至少6位字符"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              注册中...
            </>
          ) : (
            '注册'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
