"use client"

import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { isAdmin } from "@/app/lib/admin-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import type { Order } from "@/app/lib/types"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  DollarSign,
  ShoppingBag
} from "lucide-react"
import { Input } from "@/app/components/ui/input"

export default function OrderManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [lastDocId, setLastDocId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processing" | "delivered">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/v1/orders")
        const data = await response.json()
        setOrders(data.orders)
        setFilteredOrders(data.orders)
        setLastDocId(data.lastDocId)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setOrdersLoading(false)
      }
    }

    if (user && isAdmin(user.email)) {
      fetchOrders()
    }
  }, [user])

  useEffect(() => {
    let filtered = orders

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredOrders(filtered)
  }, [statusFilter, searchTerm, orders])

  const handleLoadMore = async () => {
    if (!lastDocId) return

    try {
      const response = await fetch(`/api/v1/orders?startAfter=${lastDocId}`)
      const data = await response.json()
      setOrders((prev) => [...prev, ...data.orders])
      setFilteredOrders((prev) => [...prev, ...data.orders])
      setLastDocId(data.lastDocId)
    } catch (error) {
      console.error("Error fetching more orders:", error)
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

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin(user.email)) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group transition"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Admin Dashboard</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Order Management</h1>
          <p className="text-muted-foreground text-lg">Manage and track all customer orders</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-2 border-border hover:border-accent/50 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Package className="text-accent" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-yellow-500/50 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-blue-500/50 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Loader className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Processing</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-green-500/50 transition">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-xl">
                  <TrendingUp className="text-accent" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Revenue</p>
                  <p className="text-2xl font-bold text-accent">₦{formatCurrencyDisplay(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6 border-2 border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Search by order ID, address, or product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Filter size={16} className="text-accent" />
                  Filter:
                </span>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    statusFilter === "all" 
                      ? "bg-accent text-primary shadow-lg" 
                      : "bg-transparent text-foreground hover:bg-muted"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    statusFilter === "pending" 
                      ? "bg-yellow-500 text-white shadow-lg" 
                      : "bg-transparent text-foreground hover:bg-muted"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter("processing")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    statusFilter === "processing" 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "bg-transparent text-foreground hover:bg-muted"
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => setStatusFilter("delivered")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    statusFilter === "delivered" 
                      ? "bg-green-500 text-white shadow-lg" 
                      : "bg-transparent text-foreground hover:bg-muted"
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredOrders.length}</span> of{" "}
                <span className="font-semibold text-foreground">{orders.length}</span> orders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {ordersLoading ? (
          <Card className="border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-foreground text-lg">Loading orders...</p>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-muted-foreground text-lg mb-8">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your filters or search term"
                  : "Orders will appear here when customers make purchases"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                  variant="outline"
                  size="lg"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon

                return (
                  <Card key={order.id} className="border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all group">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Package className="text-accent" size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Order ID</p>
                            <p className="text-foreground font-mono font-semibold text-lg">
                              #{order.id.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusConfig.color}`}>
                          <StatusIcon size={18} />
                          <span className="font-bold capitalize">{statusConfig.label}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Items */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <ShoppingBag size={20} className="text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-semibold mb-1">Items</p>
                            <p className="text-foreground font-bold text-lg">{order.items.length} items</p>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <DollarSign size={20} className="text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-semibold mb-1">Total</p>
                            <p className="text-accent font-bold text-xl">₦{formatCurrencyDisplay(order.totalPrice ?? 0)}</p>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <Calendar size={20} className="text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-semibold mb-1">Date</p>
                            <p className="text-foreground font-medium">
                              {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <Phone size={20} className="text-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground font-semibold mb-1">Contact</p>
                            <p className="text-foreground font-medium">{order.shippingPhone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-muted/30 p-4 rounded-lg border border-border mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin size={20} className="text-accent mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground font-semibold mb-1">Delivery Address</p>
                            <p className="text-foreground font-medium">
                              {order.deliveryType === "pickup" 
                                ? "Pickup at Geralds Plaza, Awka, Anambra" 
                                : order.shippingAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="w-full group-hover:bg-accent group-hover:text-primary group-hover:border-accent transition-all"
                        variant="outline"
                        size="lg"
                      >
                        View Full Order Details
                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Load More */}
            {lastDocId && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleLoadMore} 
                  size="lg"
                  className="bg-accent text-primary hover:bg-accent/90 font-semibold"
                >
                  <Package size={18} className="mr-2" />
                  Load More Orders
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}