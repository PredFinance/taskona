"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase"
import { Spinner } from "@/components/ui/spinner"
import type { User } from "@/lib/types"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/auth/signin")
        return
      }

      if (!currentUser.is_admin) {
        router.push("/dashboard")
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/auth/signin")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user?.is_admin) {
    return null
  }

  return <>{children}</>
}
