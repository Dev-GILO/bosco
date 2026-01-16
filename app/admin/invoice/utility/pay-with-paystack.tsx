"use client"

import { Button } from "@/app/components/ui/button"
import { useState } from "react"

interface PayWithPaystackProps {
  orderId: string
  totalPrice: number
  email: string
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function PayWithPaystack({ orderId, totalPrice, email }: PayWithPaystackProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = () => {
    setLoading(true)

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.onload = () => {
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email,
          amount: totalPrice * 100, // Convert to kobo
          ref: orderId,
          onClose: () => {
            setLoading(false)
          },
          onSuccess: (response: any) => {
            window.location.href = `/admin/invoice/${orderId}?status=success&reference=${response.reference}`
          },
        })
        handler.openIframe()
      }
    }
    document.body.appendChild(script)
  }

  return (
    <Button onClick={handlePayment} disabled={loading} className="w-full bg-accent text-background hover:opacity-90">
      {loading ? "Processing..." : "Pay with Paystack"}
    </Button>
  )
}
