"use client"

import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { isAdmin } from "@/app/lib/admin-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"

export default function CustomerManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !isAdmin(user.email)) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/admin" className="text-accent hover:underline mb-4 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="text-4xl font-bold text-primary mb-8">Customer Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-center py-8">
              No customers yet. Customers will appear here when they create accounts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
