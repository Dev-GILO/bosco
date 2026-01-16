"use client"

import StoreHeader from "@/app/components/store-header"
import { useState, useEffect } from "react"
import type { Product } from "@/app/lib/types"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { Heart, Share2, Truck, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { addToCart } from "@/app/lib/indexdb"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/lib/wishlist"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [inWishlist, setInWishlist] = useState(false)
  const router = useRouter()
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("/api/v1/store")
        const products = await response.json()
        const found = products.find((p: Product) => p.id === params.id)
        setProduct(found || null)

        if (found && userId) {
          await fetch("/api/v1/stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: params.id, userId }),
          })
        }

        if (found) {
          const wishlistStatus = await isInWishlist(found.id)
          setInWishlist(wishlistStatus)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, userId])

  const handleAddToCart = async () => {
    if (product) {
      await addToCart({
        productId: product.id,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity,
      })
      router.push("/store/cart")
    }
  }

  const handleWishlistToggle = async () => {
    if (!product) return
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id)
        setInWishlist(false)
      } else {
        await addToWishlist(product)
        setInWishlist(true)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  if (loading) {
    return (
      <>
        <StoreHeader />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <p className="text-foreground">Loading product...</p>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <StoreHeader />
        <div className="min-h-screen flex items-center justify-center pt-24 flex-col gap-4">
          <p className="text-foreground">Product not found</p>
          <Link href="/store">
            <Button className="bg-primary text-background hover:opacity-90">Back to Store</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <StoreHeader />
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/store" className="text-accent hover:underline mb-8 inline-block">
            ← Back to Collections
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden aspect-square">
                <img
                  src={product.productImage1 || "/placeholder.svg"}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.productImage2 && (
                <div className="bg-muted rounded-lg overflow-hidden aspect-video">
                  <img
                    src={product.productImage2 || "/placeholder.svg"}
                    alt={`${product.productName} - 2`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {product.productImage3 && (
                <div className="bg-muted rounded-lg overflow-hidden aspect-video">
                  <img
                    src={product.productImage3 || "/placeholder.svg"}
                    alt={`${product.productName} - 3`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-primary mb-2">{product.productName}</h1>
                    <p className="text-accent font-medium mb-4">{product.productTag}</p>
                  </div>
                  <button onClick={handleWishlistToggle} className="p-2 hover:bg-muted rounded-full transition">
                    <Heart size={24} className={inWishlist ? "fill-accent text-accent" : "text-accent"} />
                  </button>
                </div>

                <p className="text-3xl font-bold text-primary mb-6">₦{formatCurrencyDisplay(product.productPrice)}</p>

                <p className="text-foreground leading-relaxed mb-8">{product.productDescription}</p>

                {/* Size Guide */}
                {product.productSizeGuide && Object.keys(product.productSizeGuide).length > 0 && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-foreground mb-3">Size Guide</h3>
                    <div className="space-y-2">
                      {Object.entries(product.productSizeGuide).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm text-foreground">
                          <span className="capitalize">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-foreground mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border border-border rounded hover:bg-muted transition"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 border border-border rounded hover:bg-muted transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handleAddToCart} className="w-full bg-primary text-background hover:opacity-90 py-3">
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full py-3 flex items-center justify-center gap-2 bg-transparent">
                  <Share2 size={18} />
                  Share
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="border-t border-border pt-6 mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Truck size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Free Shipping</p>
                    <p className="text-sm text-muted-foreground">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Secure Checkout</p>
                    <p className="text-sm text-muted-foreground">100% protected transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
