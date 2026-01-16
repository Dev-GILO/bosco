"use client"

import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Your Dashboard</h1>
          <p className="text-foreground">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>View and manage your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">You haven't placed any orders yet.</p>
              <Link href="/store">
                <Button className="bg-primary text-background hover:opacity-90">Shop Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Your saved favorite items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/store">
                <Button className="bg-primary text-background hover:opacity-90">Browse Collections</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">Update your profile and preferences.</p>
              <Button variant="outline">View Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Home</CardTitle>
              <CardDescription>Back to Bosco</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">Discover our latest collections.</p>
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
