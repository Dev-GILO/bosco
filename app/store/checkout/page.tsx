"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getCartItems, clearCart as clearIndexDB } from "@/app/lib/indexdb"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/auth-context"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Truck, Package, MapPin, Phone, FileText } from "lucide-react"
import type { CartItem } from "@/app/lib/types"
import Image from "next/image"
import StoreHeader from "@/app/components/store-header"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"
import { db } from "@/app/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [step, setStep] = useState<"shipping" | "success">("shipping")
  const [loading, setLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(true)
  const [orderId, setOrderId] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const [deliveryType, setDeliveryType] = useState<"waybill" | "pickup">("waybill")
  const [formData, setFormData] = useState({
    username: "",
    address: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartItems = await getCartItems()
        if (cartItems.length === 0) {
          router.push("/store/cart")
          return
        }
        setItems(cartItems)

        // Auto-fill user details if logged in
        if (user?.uid) {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setFormData((prev) => ({
              ...prev,
              username: userData.username || user.displayName || "",
              phone: userData.phone || "",
              address: userData.deliveryAddress || "",
            }))
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setOrderLoading(false)
      }
    }

    loadCart()
  }, [router, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleShippingSubmit = async () => {
    if (deliveryType === "waybill" && (!formData.address || !formData.phone)) {
      alert("Please fill in all shipping fields")
      return
    }
    if (deliveryType === "pickup" && !formData.phone) {
      alert("Please provide a phone number")
      return
    }

    setLoading(true)

    try {
      const userId = user?.uid || localStorage.getItem("userId")
      const itemPrice = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)

      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items,
          shippingAddress: deliveryType === "pickup" ? "Geralds Plaza, Awka, Anambra" : formData.address,
          shippingPhone: formData.phone,
          deliveryType,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to place order")
        return
      }

      setOrderId(data.orderId)
      await clearIndexDB()
      setStep("success")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  const itemPrice = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <StoreHeader />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={64} className="text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">Order Placed Successfully!</h1>
          <p className="text-foreground text-lg mb-2">Thank you for shopping with Bosco Clothings</p>
          <p className="text-muted-foreground mb-8">
            Order ID: <span className="font-mono font-semibold text-accent">{orderId}</span>
          </p>

          <Card className="mb-8 text-left">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.productName} <span className="text-muted-foreground">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold">₦{formatCurrencyDisplay(item.productPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-base text-foreground">
                  <span className="font-semibold">Item Total (before shipping)</span>
                  <span className="text-accent font-bold">₦{formatCurrencyDisplay(itemPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Shipping fee will be added once the admin confirms your order.
                </p>
              </div>
            </CardContent>
          </Card>

          <Link href="/store">
            <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-semibold">
              <Package size={18} className="mr-2" />
              Continue Shopping
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
            href="/store/cart"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Cart</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Order Confirmation</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-border">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Truck className="text-accent" size={24} />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Delivery Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-foreground mb-3">Delivery Method</label>

                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition ${
                        deliveryType === "waybill"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="waybill"
                        checked={deliveryType === "waybill"}
                        onChange={(e) => setDeliveryType(e.target.value as "waybill")}
                        className="w-5 h-5 mt-0.5 accent-accent"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck size={20} className="text-accent" />
                          <p className="font-semibold text-foreground">Home Delivery</p>
                        </div>
                        <p className="text-sm text-muted-foreground">We'll deliver to your doorstep</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition ${
                        deliveryType === "pickup"
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={deliveryType === "pickup"}
                        onChange={(e) => setDeliveryType(e.target.value as "pickup")}
                        className="w-5 h-5 mt-0.5 accent-accent"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package size={20} className="text-accent" />
                          <p className="font-semibold text-foreground">Store Pickup</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Geralds Plaza, Awka, Anambra</p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="text-base"
                    />
                  </div>

                  {/* Address Fields */}
                  {deliveryType === "waybill" && (
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                          <MapPin size={16} className="text-accent" />
                          Delivery Address
                        </label>
                        <Input
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main St, City, State, Country"
                          className="text-base"
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone Number */}
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

                  {/* Order Notes */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <FileText size={16} className="text-accent" />
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      rows={4}
                      placeholder="Any special delivery instructions or preferences..."
                    />
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-sm text-foreground font-medium mb-2">💳 Payment Details</p>
                    <p className="text-xs text-muted-foreground">
                      Once you complete this order, you'll receive a confirmation. The final amount including shipping
                      will be shown after the admin confirms your order.
                    </p>
                  </div>

                  <Button
                    onClick={handleShippingSubmit}
                    disabled={loading}
                    size="lg"
                    className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-border shadow-lg">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Items List */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        {item.productImage && (
                          <div className="relative w-full h-full">
                            <Image
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                        <p className="text-accent font-bold mt-1">
                          ₦{formatCurrencyDisplay(item.productPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Item Total</span>
                    <span className="font-semibold">₦{formatCurrencyDisplay(itemPrice)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-accent font-semibold">TBD</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total (Final)</span>
                    <span className="text-xl font-bold text-accent">TBD</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Final amount will be calculated after shipping fee is confirmed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
