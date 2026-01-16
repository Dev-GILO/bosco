import { type NextRequest, NextResponse } from "next/server"
import * as admin from "firebase-admin"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    } as any),
  })
}

const db = admin.firestore()

export async function POST(req: NextRequest) {
  try {
    const { productId, userId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    const viewsRef = db.collection("store").doc(productId).collection("views").doc(`${year}-${month}-${day}`)

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(viewsRef)

      if (doc.exists) {
        const data = doc.data() || {}
        const userViews = data[userId] || 0

        transaction.update(viewsRef, {
          [userId]: userViews + 1,
          daily: (data.daily || 0) + 1,
          monthly: (data.monthly || 0) + 1,
          yearly: (data.yearly || 0) + 1,
        })
      } else {
        transaction.set(viewsRef, {
          [userId]: 1,
          daily: 1,
          monthly: 1,
          yearly: 1,
          date: admin.firestore.Timestamp.now(),
        })
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error tracking view:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
