'use client'

import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export function useAuthStore() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (isMounted) {
          setUser(data.user ?? null)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await postAuth('/api/auth/register', { email, password, name })

    if (result.success) {
      setUser(result.user)
    }

    return result
  }, [])

  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await postAuth('/api/auth/login', { email, password })

    if (result.success) {
      setUser(result.user)
    }

    return result
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  }
}

type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string }

async function postAuth(
  url: string,
  body: Record<string, string>
): Promise<AuthResult> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()

    if (!response.ok || !data.user) {
      return { success: false, error: data.error || '请求失败' }
    }

    return { success: true, user: data.user }
  } catch {
    return { success: false, error: '网络请求失败' }
  }
}
