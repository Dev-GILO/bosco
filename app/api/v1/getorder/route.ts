import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/app/lib/firebase-admin"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query: any = db.collection("users").doc(userId).collection("orders").orderBy("createdAt", "desc")

    if (status) {
      query = query.where("status", "==", status)
    }

    const ordersSnapshot = await query.get()
    const orders = ordersSnapshot.docs.map((doc: { id: any; data: () => { (): any; new(): any; createdAt: { (): any; new(): any; toDate: { (): any; new(): any } } } }) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }))

    return NextResponse.json(
      {
        orders,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
