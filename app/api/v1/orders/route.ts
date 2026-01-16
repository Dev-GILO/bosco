import { type NextRequest, NextResponse } from "next/server"
import { db, admin } from "@/app/lib/firebase-admin"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const startAfter = searchParams.get("startAfter")

    if (orderId) {
      const orderDoc = await db.collection("orders").doc(orderId).get()

      if (!orderDoc.exists) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      return NextResponse.json(
        {
          order: {
            id: orderDoc.id,
            ...orderDoc.data(),
          },
        },
        { status: 200 },
      )
    }

    let query: any = db.collection("orders").orderBy("createdAt", "desc").limit(10)

    if (startAfter) {
      const lastDoc = await db.collection("orders").doc(startAfter).get()
      query = query.startAfter(lastDoc)
    }

    const ordersSnapshot = await query.get()
    const orders = ordersSnapshot.docs.map((doc: { id: any; data: () => any }) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(
      {
        orders,
        lastDocId: orders.length > 0 ? orders[orders.length - 1].id : null,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, items, shippingAddress, shippingPhone, deliveryType, notes } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    // Calculate item price (subtotal without shipping)
    const itemPrice = items.reduce((sum: number, item: any) => sum + item.productPrice * item.quantity, 0)

    // Create order document
    const orderRef = await db.collection("orders").add({
      userId,
      items,
      shippingAddress,
      shippingPhone,
      deliveryType,
      notes,
      itemPrice,
      totalPrice: null, // Will be set when admin adds shipping fee
      shippingFee: null,
      status: "pending",
      settledByPaystack: false,
      createdAt: admin.firestore.Timestamp.now(),
    })

    const orderId = orderRef.id

    // Create user's order reference in userOrders subcollection
    if (userId) {
      await db
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(orderId)
        .set({
          orderId,
          productIds: items.map((item: any) => item.productId),
          items,
          itemPrice,
          shippingAddress,
          shippingPhone,
          totalPrice: null,
          shippingFee: null,
          status: "pending",
          createdAt: admin.firestore.Timestamp.now(),
        })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const datePath = `${year}/${month}/${day}`

    const batch = db.batch()

    // Update total orders count
    const orderDataRef = db.collection("OrderData").doc("stats")
    batch.set(
      orderDataRef,
      {
        totalOrders: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.Timestamp.now(),
      },
      { merge: true },
    )

    // Update daily order count
    const dailyRef = db.collection("OrderData").doc(datePath)
    batch.set(
      dailyRef,
      {
        orders: admin.firestore.FieldValue.increment(1),
        date: datePath,
      },
      { merge: true },
    )

    await batch.commit()

    return NextResponse.json(
      {
        success: true,
        orderId,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const { status } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    if (!status || !["pending", "processing", "delivered"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const orderRef = db.collection("orders").doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Update both main order and user's order subcollection
    await orderRef.update({
      status,
      updatedAt: admin.firestore.Timestamp.now(),
    })

    if (orderData?.userId) {
      await db.collection("users").doc(orderData.userId).collection("orders").doc(orderId).update({
        status,
        updatedAt: admin.firestore.Timestamp.now(),
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
