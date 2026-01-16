"use client"

import Link from "next/link"
import { Heart, ShoppingCart, User, LogOut } from "lucide-react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StoreHeader() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/users", {
        method: "DELETE",
      })
      localStorage.removeItem("userId")
      router.push("/store")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/store" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-background font-bold">BC</span>
          </div>
          <span className="text-lg font-bold text-primary hidden sm:inline">Bosco Clothings</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link href="/store" className="text-foreground hover:text-accent transition">
            Shop
          </Link>
          <Link href="/store/wishlist" className="text-foreground hover:text-accent transition">
            Collections
          </Link>
          <Link href="/bookings" className="text-foreground hover:text-accent transition">
            Book
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/store/wishlist" className="p-2 hover:bg-muted rounded-full transition">
            <Heart size={20} className="text-accent" />
          </Link>

          <Link href="/store/cart" className="p-2 hover:bg-muted rounded-full transition">
            <ShoppingCart size={20} className="text-accent" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-muted rounded-full transition"
            >
              <User size={20} className="text-accent" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg">
                {!loading && user ? (
                  <>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm text-foreground font-medium truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/store/auth" className="block px-4 py-3 text-sm text-foreground hover:bg-muted">
                      Sign In
                    </Link>
                    <Link href="/store/auth" className="block px-4 py-3 text-sm text-foreground hover:bg-muted">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
