"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ArrowLeft, MapPin, Phone, Truck, AlertCircle } from "lucide-react"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"
import Image from "next/image"

interface Order {
  id: string
  items: any[]
  itemPrice: number
  totalPrice?: number
  shippingFee?: number
  status: "pending" | "processing" | "delivered"
  deliveryType: "waybill" | "pickup"
  shippingAddress: string
  shippingPhone: string
  notes?: string
  createdAt: { toDate?: () => Date } | Date
}

export default function OrderDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const loadOrder = async () => {
      if (user?.uid && orderId) {
        try {
          const response = await fetch(`/api/v1/getorder?userId=${user.uid}`)
          const data = await response.json()

          if (response.ok) {
            const foundOrder = data.orders.find((o: Order) => o.id === orderId)
            if (foundOrder) {
              setOrder(foundOrder)
            }
          }
        } catch (error) {
          console.error("Error loading order:", error)
        }
      }
      setPageLoading(false)
    }

    loadOrder()
  }, [user, loading, router, orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h2>
          <Link href="/dashboard/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const orderDate = typeof order.createdAt === 'object' && order.createdAt !== null && 'toDate' in order.createdAt && typeof (order.createdAt as any).toDate === 'function' ? (order.createdAt as any).toDate() : new Date(order.createdAt as any)
  const displayAmount = order.totalPrice || order.itemPrice

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Orders</span>
          </Link>
          <h1 className="text-4xl font-bold text-primary">Order Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card className="border-2 border-border">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-mono">{order.id}</CardTitle>
                    <p className="text-muted-foreground text-sm mt-1">
                      {orderDate.toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Items */}
            <Card className="border-2 border-border">
              <CardHeader className="bg-muted/30">
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        {item.selectedSize && (
                          <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                        )}
                        {item.selectedColor && (
                          <p className="text-sm text-muted-foreground">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-accent font-bold mt-2">
                          ₦{formatCurrencyDisplay(item.productPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="border-2 border-border">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Truck size={20} className="text-accent" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Delivery Method</p>
                  <p className="text-foreground capitalize">
                    {order.deliveryType === "pickup" ? "Store Pickup" : "Home Delivery"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1 flex items-center gap-2">
                    <MapPin size={14} /> Delivery Address
                  </p>
                  <p className="text-foreground">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1 flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </p>
                  <p className="text-foreground">{order.shippingPhone}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Order Notes</p>
                    <p className="text-foreground">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-24 border-2 border-border">
              <CardHeader className="bg-muted/30">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Item Total</span>
                  <span className="font-semibold">₦{formatCurrencyDisplay(order.itemPrice)}</span>
                </div>

                {order.shippingFee && (
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="font-semibold">₦{formatCurrencyDisplay(order.shippingFee)}</span>
                  </div>
                )}

                {order.status === "pending" && !order.shippingFee && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">Awaiting admin confirmation for shipping fee</p>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-accent">₦{formatCurrencyDisplay(displayAmount)}</span>
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
