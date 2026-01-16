import { type NextRequest, NextResponse } from "next/server"
import { db, admin } from "@/app/lib/firebase-admin"

export async function GET() {
  try {
    const productsSnapshot = await db.collection("store").get()
    const products = productsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        productName: data.productName,
        productDescription: data.productDescription,
        productPrice: data.productPrice,
        productTag: data.productTag,
        productImage1: data.productImage1 || "",
        productImage2: data.productImage2 || "",
        productImage3: data.productImage3 || "",
        productSizeGuide: data.productSizeGuide || {},
        featured: data.featured || false,
        creationDate: data.creationDate ? new Date(data.creationDate.toDate()) : new Date(),
      }
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productName, productDescription, productPrice, productTag, productImages, productSizeGuide } =
      await req.json()

    if (!productName || !productDescription || !productPrice || !productTag) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const imageUrls = Array.isArray(productImages) ? productImages.filter((img) => typeof img === "string") : []

    // Create product document
    const productRef = await db.collection("store").add({
      productName,
      productDescription,
      productPrice: Number(productPrice),
      productTag,
      productImage1: imageUrls[0] || "",
      productImage2: imageUrls[1] || "",
      productImage3: imageUrls[2] || "",
      productSizeGuide: productSizeGuide || {},
      creationDate: admin.firestore.Timestamp.now(),
      featured: false,
    })

    // Increment product count in admin collection
    const adminRef = db.collection("admin").doc("stats")
    await adminRef
      .update({
        productCount: admin.firestore.FieldValue.increment(1),
      })
      .catch(async () => {
        // Create if doesn't exist
        await adminRef.set({ productCount: 1 })
      })

    return NextResponse.json(
      {
        success: true,
        id: productRef.id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
