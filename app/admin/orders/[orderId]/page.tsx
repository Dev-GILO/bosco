"use client"

import { useAuth } from "@/app/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { isAdmin } from "@/app/lib/admin-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import Link from "next/link"
import type { Order } from "@/app/lib/types"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  FileText, 
  Truck, 
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  DollarSign
} from "lucide-react"
import Image from "next/image"

export default function OrderDetails() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [orderLoading, setOrderLoading] = useState(true)
  const [shippingFee, setShippingFee] = useState<number>(order?.shippingFee || 0)
  const [saving, setSaving] = useState(false)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/v1/orders?orderId=${orderId}`)
        const data = await response.json()
        setOrder(data.order)
        if (data.order?.shippingFee) {
          setShippingFee(data.order.shippingFee)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setOrderLoading(false)
      }
    }

    if (user && isAdmin(user.email) && orderId) {
      fetchOrder()
    }
  }, [user, orderId])

  const handleUpdateShippingFee = async () => {
    if (!order) return

    setSaving(true)
    try {
      const response = await fetch(`/api/v1/createOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          shippingFee,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setOrder({
          ...order,
          shippingFee,
          totalPrice: order.itemPrice + shippingFee,
        })
      } else {
        alert("Failed to update shipping fee")
      }
    } catch (error) {
      console.error("Error updating shipping fee:", error)
      alert("Error updating shipping fee")
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (!order || !order.totalPrice) {
      alert("Total price must be set before generating invoice")
      return
    }

    try {
      const response = await fetch("/api/v1/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setInvoiceId(data.invoiceId)
        router.push(`/admin/invoice/${data.invoiceId}`)
      } else {
        alert("Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      alert("Error generating invoice")
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return

    try {
      const response = await fetch(`/api/v1/orders?orderId=${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrder({ ...order, status: newStatus as "pending" | "processing" | "delivered" })
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status")
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          icon: Clock,
          label: "Pending"
        }
      case "processing":
        return {
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: Package,
          label: "Processing"
        }
      case "delivered":
        return {
          color: "bg-green-500/10 text-green-600 border-green-500/20",
          icon: CheckCircle,
          label: "Delivered"
        }
      default:
        return {
          color: "bg-muted text-muted-foreground border-border",
          icon: AlertCircle,
          label: status
        }
    }
  }

  if (loading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(user.email)) {
    return null
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Orders</span>
          </Link>
          <Card className="border-2 border-border">
            <CardContent className="p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground text-xl font-semibold">Order not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Orders</span>
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Order Details</h1>
              <p className="text-muted-foreground text-lg font-mono">#{order.id}</p>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${statusConfig.color}`}>
              <StatusIcon size={24} />
              <span className="font-bold text-lg">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Stats */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Package className="text-accent" size={28} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Total Items</p>
                  <p className="text-3xl font-bold text-foreground">{order.items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <DollarSign className="text-accent" size={28} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Item Total</p>
                  <p className="text-3xl font-bold text-accent">₦{formatCurrencyDisplay(order.itemPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Calendar className="text-accent" size={28} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Order Date</p>
                  <p className="text-lg font-bold text-foreground">
                    {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Status Management */}
          <Card className="border-2 border-border">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-3">
                <Package className="text-accent" size={24} />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4 font-medium">Update order status</p>
              <div className="grid grid-cols-3 gap-3">
                {["pending", "processing", "delivered"].map((s) => {
                  const isActive = order.status === s
                  return (
                    <Button
                      key={s}
                      onClick={() => handleStatusUpdate(s)}
                      size="lg"
                      className={`${
                        isActive
                          ? "bg-accent text-primary border-2 border-accent shadow-lg"
                          : "bg-muted text-foreground hover:bg-muted/80 border-2 border-transparent"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-2 border-border">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-3">
                <Truck className="text-accent" size={24} />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Delivery Type</p>
                  <p className="font-medium text-foreground capitalize">{order.deliveryType}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Shipping Address</p>
                  <p className="font-medium text-foreground">{order.shippingAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-accent mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Phone Number</p>
                  <p className="font-medium text-foreground">{order.shippingPhone}</p>
                </div>
              </div>

              {order.notes && (
                <div className="flex items-start gap-3 pt-4 border-t border-border">
                  <FileText size={20} className="text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Special Notes</p>
                    <p className="font-medium text-foreground">{order.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6 border-2 border-border">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-3">
              <Package className="text-accent" size={24} />
              Order Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-accent/50 transition"
                >
                  <div className="w-20 h-20 bg-background rounded-lg overflow-hidden border border-border flex-shrink-0">
                    {item.productImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg mb-1">{item.productName}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="font-semibold">Qty: {item.quantity}</span>
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Item Total</p>
                    <p className="text-2xl font-bold text-accent">
                      ₦{formatCurrencyDisplay(item.productPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Invoice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping Fee Management */}
          <Card className="border-2 border-border">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-3">
                <Truck className="text-accent" size={24} />
                Shipping Fee
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <CreditCard size={16} className="text-accent" />
                  Shipping Cost (₦)
                </label>
                <Input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value)))}
                  min="0"
                  className="text-lg font-semibold"
                  placeholder="Enter shipping fee"
                />
              </div>

              <Button
                onClick={handleUpdateShippingFee}
                disabled={saving}
                size="lg"
                className="w-full bg-accent text-primary hover:bg-accent/90 font-semibold"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Update Shipping Fee
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary & Invoice */}
          <Card className="border-2 border-accent">
            <CardHeader className="bg-accent/10">
              <CardTitle className="flex items-center gap-3 text-accent">
                <Receipt size={24} />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Items Subtotal</span>
                  <span className="font-semibold">₦{formatCurrencyDisplay(order.itemPrice)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span className="font-semibold">₦{formatCurrencyDisplay(shippingFee)}</span>
                </div>
                <div className="border-t-2 border-border pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Grand Total</span>
                  <span className="text-3xl font-bold text-accent">
                    ₦{formatCurrencyDisplay(order.totalPrice || (order.itemPrice + shippingFee))}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleGenerateInvoice}
                disabled={!order.totalPrice}
                size="lg"
                className="w-full bg-primary text-background hover:opacity-90 font-semibold"
              >
                <Receipt size={18} className="mr-2" />
                Generate Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}