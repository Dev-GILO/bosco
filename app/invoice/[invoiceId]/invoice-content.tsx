"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { InvoiceTable } from "@/app/admin/invoice/utility/table"
import { PayWithPaystack } from "@/app/admin/invoice/utility/pay-with-paystack"
import { PaymentStatus } from "@/app/admin/invoice/utility/payment-status"
import type { CartItem } from "@/app/lib/types"
import { useEffect, useState } from "react"

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
  phone: string
  status: string
  createdAt: any
  settledByPaystack: boolean
}

export function InvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get("id")
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError("Invoice ID is required")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/v1/invoice/get?invoiceId=${invoiceId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to fetch invoice")
          return
        }

        setInvoice(data.invoice)
      } catch (err) {
        console.error("Error fetching invoice:", err)
        setError("Failed to fetch invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading invoice...</div>
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-red-500 mb-4">{error || "Invoice not found"}</p>
          <Button onClick={() => router.back()} className="bg-primary text-background hover:opacity-90">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const createdDate = new Date(
    invoice.createdAt?.seconds ? invoice.createdAt.seconds * 1000 : invoice.createdAt,
  ).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 relative">
      <PaymentStatus settledByPaystack={invoice.settledByPaystack} />

      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={() => router.back()} className="text-accent hover:underline mb-4 inline-block">
          ← Back
        </Button>

        <Card className="mb-8">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">INVOICE</CardTitle>
                <p className="text-sm text-muted-foreground">Invoice ID: {invoice.id}</p>
                <p className="text-sm text-muted-foreground">Order ID: {invoice.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bosco Clothings</p>
                <p className="text-sm text-muted-foreground">Premium African Fashion</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">BILL TO</p>
                <p className="font-semibold text-foreground">{invoice.username}</p>
                <p className="text-sm text-muted-foreground">{invoice.email}</p>
                <p className="text-sm text-muted-foreground">{invoice.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">INVOICE DETAILS</p>
                <p className="text-sm text-muted-foreground">Date: {createdDate}</p>
                <p className="text-sm text-muted-foreground">Delivery Type: {invoice.deliveryType}</p>
              </div>
            </div>

            <div className="my-8">
              <InvoiceTable
                items={invoice.items}
                itemPrice={invoice.itemPrice}
                shippingFee={invoice.shippingFee}
                totalPrice={invoice.totalPrice}
              />
            </div>

            {invoice.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1">NOTES</p>
                <p className="text-sm text-foreground">{invoice.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              {invoice.settledByPaystack ? (
                <div className="p-4 bg-green-100 border border-green-300 rounded text-green-800">
                  <p className="font-semibold">Payment Completed</p>
                  <p className="text-sm">This invoice has been paid via Paystack</p>
                </div>
              ) : (
                <PayWithPaystack orderId={invoice.orderId} totalPrice={invoice.totalPrice || 0} email={invoice.email} />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => window.print()} className="flex-1 bg-gray-600 text-white hover:bg-gray-700">
            Print Invoice
          </Button>
          <Button onClick={() => router.back()} className="flex-1 bg-primary text-background hover:opacity-90">
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
