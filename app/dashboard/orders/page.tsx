"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ArrowLeft, Package, Calendar, Clock, ShoppingBag, ChevronRight } from "lucide-react"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"

interface Order {
  id: string
  itemPrice: number
  totalPrice?: number
  status: "pending" | "processing" | "delivered"
  createdAt: { toDate?: () => Date } | Date
  items: any[]
  shippingAddress: string
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processing" | "delivered">("all")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const loadOrders = async () => {
      if (user?.uid) {
        try {
          const filterParam = statusFilter !== "all" ? `&status=${statusFilter}` : ""
          const response = await fetch(`/api/v1/getorder?userId=${user.uid}${filterParam}`)
          const data = await response.json()

          if (response.ok && data.orders) {
            let filteredOrders = data.orders
            if (statusFilter !== "all") {
              filteredOrders = data.orders.filter((order: Order) => order.status === statusFilter)
            }
            setOrders(filteredOrders)
          } else {
            console.error("Failed to load orders:", data.error)
            setOrders([])
          }
        } catch (error) {
          console.error("Error loading orders:", error)
          setOrders([])
        }
      }
      setPageLoading(false)
    }

    loadOrders()
  }, [user, loading, router, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳"
      case "processing":
        return "📦"
      case "delivered":
        return "✅"
      default:
        return "📋"
    }
  }

  // ✅ Fixed date handling
  const formatOrderDate = (orderDate: { toDate?: () => Date } | Date) => {
    let date: Date
    
    if (orderDate && typeof orderDate === 'object' && 'toDate' in orderDate && orderDate.toDate) {
      date = orderDate.toDate()
    } else {
      date = new Date(orderDate as any)
    }

    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Your Orders</h1>
              <p className="text-muted-foreground text-lg">Track and manage all your purchases</p>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-3 rounded-lg border border-border">
              <Package className="text-accent" size={24} />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6 border-2 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock size={16} className="text-accent" />
                Filter by Status:
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  statusFilter === "all" 
                    ? "bg-accent text-primary shadow-lg" 
                    : "bg-transparent text-foreground hover:bg-muted"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  statusFilter === "pending" 
                    ? "bg-yellow-500 text-white shadow-lg" 
                    : "bg-transparent text-foreground hover:bg-muted"
                }`}
              >
                ⏳ Pending
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  statusFilter === "processing" 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "bg-transparent text-foreground hover:bg-muted"
                }`}
              >
                📦 Processing
              </button>
              <button
                onClick={() => setStatusFilter("delivered")}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  statusFilter === "delivered" 
                    ? "bg-green-500 text-white shadow-lg" 
                    : "bg-transparent text-foreground hover:bg-muted"
                }`}
              >
                ✅ Delivered
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {statusFilter !== "all" ? `No ${statusFilter} orders` : "No orders yet"}
              </h3>
              <p className="text-muted-foreground text-lg mb-8">
                {statusFilter !== "all" 
                  ? "Try selecting a different status filter" 
                  : "Start shopping to see your orders here"}
              </p>
              <Link href="/store">
                <Button size="lg" className="bg-accent text-primary hover:bg-accent/90 font-semibold">
                  <Package size={18} className="mr-2" />
                  Browse Collections
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const displayAmount = order.totalPrice || order.itemPrice

              return (
                <Card key={order.id} className="border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all group">
                  <CardHeader className="bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Package className="text-accent" size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Order ID</p>
                          <p className="text-foreground font-mono font-semibold">
                            #{order.id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-2 capitalize border-2 ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          <span>{getStatusIcon(order.status)}</span>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Calendar size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-semibold mb-1">Order Date</p>
                          <p className="text-foreground font-medium">
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <span className="text-accent text-xl font-bold">₦</span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-semibold mb-1">Total Amount</p>
                          <p className="text-accent text-xl font-bold">
                            ₦{formatCurrencyDisplay(displayAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <ShoppingBag size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-semibold mb-1">Items</p>
                          <p className="text-foreground font-medium">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border mb-4">
                      <p className="text-sm text-muted-foreground font-semibold mb-2">Order Contents</p>
                      <p className="text-foreground">
                        {order.items
                          .slice(0, 3)
                          .map((item) => item.productName)
                          .join(", ")}
                        {order.items.length > 3 && (
                          <span className="text-accent font-semibold"> +{order.items.length - 3} more items</span>
                        )}
                      </p>
                    </div>

                    {/* View Details Button */}
                    <Link href={`/dashboard/orders/${order.id}`} className="block">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-accent group-hover:text-primary group-hover:border-accent transition-all"
                      >
                        View Full Details
                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}