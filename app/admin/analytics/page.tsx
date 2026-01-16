"use client"

import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { isAdmin } from "@/app/lib/admin-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"

export default function Analytics() {
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
        <h1 className="text-4xl font-bold text-primary mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-center py-8">Chart will appear here once you have sales data.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground text-center py-8">
                Top products will appear here once you have sales data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
