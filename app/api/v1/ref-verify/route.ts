import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/firebase-admin"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const orderDoc = await db.collection("orders").doc(orderId).get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()
    const settledByPaystack = orderData?.settledByPaystack ?? false

    return NextResponse.json(
      {
        orderId,
        settledByPaystack,
        status: settledByPaystack ? "PAID" : "UNPAID",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error verifying payment status:", error)
    return NextResponse.json({ error: "Failed to verify payment status" }, { status: 500 })
  }
}
