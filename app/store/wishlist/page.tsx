"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Product } from "@/app/lib/types"
import { Button } from "@/app/components/ui/button"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { getWishlist, removeFromWishlist } from "@/app/lib/wishlist"
import { addToCart } from "@/app/lib/indexdb"
import { useRouter } from "next/navigation"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const items = await getWishlist()
        setWishlistItems(items)
      } catch (error) {
        console.error("Error loading wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [])

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
      setWishlistItems(wishlistItems.filter((item) => item.id !== productId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        productId: product.id,
        productName: product.productName,
        productPrice: product.productPrice,
        quantity: 1,
      })
      router.push("/store/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <p className="text-foreground">Loading wishlist...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/store" className="text-accent hover:underline mb-8 inline-block">
          ← Back to Collections
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-2">My Wishlist</h1>
        <p className="text-foreground text-lg mb-8">
          {wishlistItems.length === 0 ? "Your wishlist is empty" : `${wishlistItems.length} item(s) in your wishlist`}
        </p>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="text-accent mx-auto mb-4 opacity-50" />
            <p className="text-foreground mb-6">No items in your wishlist yet</p>
            <Link href="/store">
              <Button className="bg-primary text-background hover:opacity-90">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className="bg-muted rounded-lg overflow-hidden flex flex-col">
                <Link href={`/store/${product.id}`}>
                  <div className="relative bg-background rounded-lg overflow-hidden mb-4 aspect-square group">
                    <img
                      src={product.productImage1 || "/placeholder.svg"}
                      alt={product.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="px-4 pb-4 flex flex-col flex-grow">
                  <Link href={`/store/${product.id}`}>
                    <h3 className="font-semibold text-foreground hover:text-accent transition mb-2">
                      {product.productName}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground mb-3 flex-grow">{product.productTag}</p>

                  <p className="text-lg font-bold text-primary mb-4">₦{formatCurrencyDisplay(product.productPrice)}</p>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-primary text-background hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      variant="outline"
                      className="w-full bg-transparent flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
