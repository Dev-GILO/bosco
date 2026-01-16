"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { InvoiceTable } from "../utility/table"
import { PayWithPaystack } from "../utility/pay-with-paystack"
import type { CartItem } from "@/app/lib/types"

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

interface InvoiceContentProps {
  invoice: Invoice
}

export function InvoiceContent({ invoice }: InvoiceContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get("status")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href={`/admin/orders/${invoice.orderId}`} className="text-accent hover:underline mb-4 inline-block">
          ← Back to Order
        </Link>

        {paymentStatus === "success" && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded text-green-800">
            Payment successful! Order status will be updated to processing.
          </div>
        )}

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
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">INVOICE DETAILS</p>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(invoice.createdAt?.toDate?.()).toLocaleDateString()}
                </p>
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
              <PayWithPaystack orderId={invoice.orderId} totalPrice={invoice.totalPrice || 0} email={invoice.email} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => window.print()} className="flex-1 bg-gray-600 text-white hover:bg-gray-700">
            Print Invoice
          </Button>
          <Button
            onClick={() => router.push("/admin/orders")}
            className="flex-1 bg-primary text-background hover:opacity-90"
          >
            Back to Orders
          </Button>
        </div>
      </div>
    </div>
  )
}
