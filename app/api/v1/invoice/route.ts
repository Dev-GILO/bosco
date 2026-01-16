import { type NextRequest, NextResponse } from "next/server"
import { db, admin } from "@/app/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    const orderDoc = await db.collection("orders").doc(orderId).get()
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data() as any
    const userId = orderData.userId

    let username = ""
    let email = ""

    if (userId) {
      const userDoc = await db.collection("users").doc(userId).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        username = userData?.username || "N/A"
        email = userData?.email || "N/A"
      }
    }

    const invoiceRef = await db.collection("invoices").add({
      orderId,
      userId,
      items: orderData.items,
      itemPrice: orderData.itemPrice,
      shippingFee: orderData.shippingFee,
      totalPrice: orderData.totalPrice,
      deliveryType: orderData.deliveryType,
      notes: orderData.notes,
      username,
      email,
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
    })

    return NextResponse.json(
      {
        success: true,
        invoiceId: invoiceRef.id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}

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
