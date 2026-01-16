"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ArrowLeft, User, Phone, MapPin, Mail } from "lucide-react"
import { db } from "@/app/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    deliveryAddress: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setFormData({
              username: userData.username || "",
              phone: userData.phone || "",
              deliveryAddress: userData.deliveryAddress || "",
            })
          }
        } catch (error) {
          console.error("Error loading user data:", error)
        }
      }
      setPageLoading(false)
    }

    loadUserData()
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    if (!user?.uid) return

    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: formData.username,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
      })
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl font-bold text-primary">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your profile information</p>
        </div>

        <Card className="border-2 border-border">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <User className="text-accent" size={24} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Mail size={16} className="text-accent" />
                Email
              </label>
              <Input value={user.email || ""} disabled className="text-base bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <User size={16} className="text-accent" />
                Full Name
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="text-base"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Phone size={16} className="text-accent" />
                Phone Number
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+234 800 000 0000"
                className="text-base"
              />
            </div>

            {/* Delivery Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <MapPin size={16} className="text-accent" />
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter your complete delivery address"
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={4}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
