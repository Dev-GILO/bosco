import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/firebase-admin"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get("invoiceId")

    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 })
    }

    const invoiceDoc = await db.collection("invoices").doc(invoiceId).get()

    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = {
      id: invoiceDoc.id,
      ...invoiceDoc.data(),
    }

    return NextResponse.json({ invoice }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 })
  }
}
