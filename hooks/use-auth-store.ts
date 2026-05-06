'use client'

import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface StoredUser extends User {
  password: string
}

const AUTH_STORAGE_KEY = 'gift-book-auth'
const USERS_STORAGE_KEY = 'gift-book-users'

export function useAuthStore() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const getStoredUsers = useCallback((): StoredUser[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return []
      }
    }
    return []
  }, [])

  const saveStoredUsers = useCallback((users: StoredUser[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ success: boolean; error?: string }> => {
      const users = getStoredUsers()

      if (users.some((u) => u.email === email)) {
        return { success: false, error: '该邮箱已被注册' }
      }

      if (password.length < 6) {
        return { success: false, error: '密码长度至少为6位' }
      }

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        email,
        password,
        name,
        createdAt: new Date().toISOString(),
      }

      saveStoredUsers([...users, newUser])

      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword))

      return { success: true }
    },
    [getStoredUsers, saveStoredUsers]
  )

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      const users = getStoredUsers()
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      )

      if (!foundUser) {
        return { success: false, error: '邮箱或密码错误' }
      }

      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword))

      return { success: true }
    },
    [getStoredUsers]
  )

  const signOut = useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
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
