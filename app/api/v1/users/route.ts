import { type NextRequest, NextResponse } from "next/server"
import { db, auth, admin } from "@/app/lib/firebase-admin"

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, action } = await req.json()

    if (action === "signup") {
      if (!email || !password || !username) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
      })

      // Store user data in Firestore
      await db.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        username,
        email,
        accountCreatedAt: admin.firestore.Timestamp.now(),
      })

      // Generate custom token for session
      const customToken = await auth.createCustomToken(userRecord.uid)

      return NextResponse.json(
        {
          success: true,
          uid: userRecord.uid,
          token: customToken,
        },
        { status: 201 },
      )
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
      }

      // Verify user exists by getting their user record
      const userRecord = await auth.getUserByEmail(email)

      // Generate custom token for session
      const customToken = await auth.createCustomToken(userRecord.uid)

      // Fetch user data from Firestore
      const userDoc = await db.collection("users").doc(userRecord.uid).get()

      return NextResponse.json(
        {
          success: true,
          uid: userRecord.uid,
          token: customToken,
          user: userDoc.data(),
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 400 })
  }
}
