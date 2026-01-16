"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingCart, LogOut } from "lucide-react"
import { useAuth } from "@/app/lib/auth-context"
import { useCart } from "@/app/lib/cart-context"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { items } = useCart()

  const handleLogout = async () => {
    await logout()
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="fixed w-full top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative block">
          <Image
            src="/logo.jpg"
            alt="Bosco Clothings"
            width={50}
            height={50}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#collections" className="nav-link text-sm text-foreground hover:text-accent transition">
            Collections
          </Link>
          <Link href="#about" className="nav-link text-sm text-foreground hover:text-accent transition">
            About
          </Link>
          <Link href="/bookings" className="nav-link text-sm text-foreground hover:text-accent transition">
            Book Appointment
          </Link>
          <Link href="#contact" className="nav-link text-sm text-foreground hover:text-accent transition">
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/store" className="nav-link text-sm font-medium text-accent hover:text-primary transition">
            Shop
          </Link>
          <Link href="/cart" className="p-2 hover:bg-muted transition relative rounded">
            <ShoppingCart size={20} className="text-primary" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground hidden sm:inline">{user.email}</span>
              <button onClick={handleLogout} className="p-2 hover:bg-muted transition text-primary rounded">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Link href="/login" className="nav-link text-sm font-medium text-foreground hover:text-accent transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-primary text-background px-4 py-2 rounded hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted transition rounded">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="#collections" className="text-sm text-foreground hover:text-accent transition">
              Collections
            </Link>
            <Link href="#about" className="text-sm text-foreground hover:text-accent transition">
              About
            </Link>
            <Link href="/bookings" className="text-sm text-foreground hover:text-accent transition">
              Book Appointment
            </Link>
            <Link href="#contact" className="text-sm text-foreground hover:text-accent transition">
              Contact
            </Link>
            {!user && (
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link href="/login" className="text-sm font-medium text-foreground hover:text-accent transition">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-primary text-background px-4 py-2 rounded text-center hover:opacity-90 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Smooth Underline Animation Styles */}
      <style jsx>{`
        .nav-link {
          position: relative;
          display: inline-block;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background-color: var(--color-accent);
          transition: width 0.3s ease, left 0.3s ease;
        }
        
        .nav-link:hover::after {
          width: 100%;
          left: 0;
        }
      `}</style>
    </header>
  )
}