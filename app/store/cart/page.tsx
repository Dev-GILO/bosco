"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package, Truck, Shield } from "lucide-react"
import { getCartItems, removeFromCart, updateCartItem, clearCart as clearIndexDB } from "@/app/lib/indexdb"
import type { CartItem } from "@/app/lib/types"
import Image from "next/image"
import StoreHeader from "@/app/components/store-header"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartItems = await getCartItems()
        setItems(cartItems)
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId)
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await handleRemove(productId)
    } else {
      await updateCartItem(productId, quantity)
      setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearIndexDB()
      setItems([])
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center px-4">
        <StoreHeader />
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-muted-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Discover our exquisite collection and add items to your cart
          </p>
          <Link href="/store">
            <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-semibold">
              <ShoppingBag size={18} className="mr-2" />
              Explore Collections
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <StoreHeader />
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Shopping Cart</h1>
            <span className="text-muted-foreground text-lg">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                      <div className="w-full h-full relative">
                        <Image
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-foreground text-xl mb-2">{item.productName}</h3>
                        <p className="text-2xl font-bold text-accent">₦{formatCurrencyDisplay(item.productPrice)}</p>
                      </div>

                      {/* Quantity Controls - Desktop */}
                      <div className="hidden sm:flex items-center gap-4">
                        <span className="text-sm text-muted-foreground font-medium">Quantity:</span>
                        <div className="inline-flex items-center gap-3 border border-border rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-semibold text-foreground min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Total - Desktop */}
                    <div className="hidden sm:flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive group"
                        aria-label="Remove item"
                      >
                        <Trash2 size={20} className="group-hover:scale-110 transition" />
                      </button>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                        <p className="text-2xl font-bold text-primary">
                          ₦{formatCurrencyDisplay(item.productPrice * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="sm:hidden flex flex-col gap-4">
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Quantity & Total */}
                  <div className="sm:hidden mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="inline-flex items-center gap-3 border border-border rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-semibold text-foreground min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      ₦{formatCurrencyDisplay(item.productPrice * item.quantity)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button - Below Items */}
            <div className="pt-4">
              <Button onClick={handleClearCart} variant="ghost" className="text-destructive hover:bg-destructive/10">
                <Trash2 size={16} className="mr-2" />
                Clear Entire Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-border shadow-lg">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₦{formatCurrencyDisplay(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-semibold">₦{formatCurrencyDisplay(tax)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-3xl font-bold text-accent">₦{formatCurrencyDisplay(total)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Link href="/store/checkout" className="block w-full">
                    <Button size="lg" className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold">
                      <Package size={18} className="mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link href="/store" className="block w-full">
                    <Button variant="outline" size="lg" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Truck size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Free Shipping</p>
                      <p className="text-xs text-muted-foreground">On orders over ₦100</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Shield size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Secure Checkout</p>
                      <p className="text-xs text-muted-foreground">100% protected</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
