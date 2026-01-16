 "use client"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { isAdmin } from "@/app/lib/admin-utils"
import Link from "next/link"
import type { CartItem } from "@/app/lib/types"
import { InvoiceContent } from "./invoice-content"

interface Invoice {
  id: string
  orderId: string
  userId: string
  items: CartItem[]
  itemPrice: number
  shippingFee?: number
  totalPrice?: number
  deliveryType: string
  notes?: string
  username: string
  email: string
  status: string
  createdAt: any
}

function InvoicePageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.invoiceId as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [invoiceLoading, setInvoiceLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/v1/invoice?invoiceId=${invoiceId}`)
        const data = await response.json()
        setInvoice(data.invoice)
      } catch (error) {
        console.error("Error fetching invoice:", error)
      } finally {
        setInvoiceLoading(false)
      }
    }

    if (user && isAdmin(user.email) && invoiceId) {
      fetchInvoice()
    }
  }, [user, invoiceId])

  if (loading || invoiceLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !isAdmin(user.email)) {
    return null
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/admin/orders" className="text-accent hover:underline mb-4 inline-block">
            ← Back to Orders
          </Link>
          <p className="text-foreground">Invoice not found</p>
        </div>
      </div>
    )
  }

  return <InvoiceContent invoice={invoice} />
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading invoice...</div>}>
      <InvoicePageContent />
    </Suspense>
  )
}
