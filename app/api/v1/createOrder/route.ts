import { type NextRequest, NextResponse } from "next/server"
import { db, admin } from "@/app/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const { orderId, shippingFee } = await req.json()

    if (!orderId || shippingFee === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const orderDoc = await db.collection("orders").doc(orderId).get()
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data() as any
    const itemPrice = orderData.itemPrice
    const totalPrice = itemPrice + shippingFee
    const userId = orderData.userId

    await db
      .collection("orders")
      .doc(orderId)
      .update({
        shippingFee: Number(shippingFee),
        totalPrice: totalPrice,
        status: "pending",
        updatedAt: admin.firestore.Timestamp.now(),
      })

    if (userId) {
      await db
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(orderId)
        .update({
          shippingFee: Number(shippingFee),
          totalPrice: totalPrice,
          updatedAt: admin.firestore.Timestamp.now(),
        })
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        totalPrice,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
