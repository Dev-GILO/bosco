import { Suspense } from "react"
import { InvoiceContent } from "./invoice-content"

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  )
}
