"use client"

import type React from "react"

import StoreHeader from "@/app/components/store-header"
import { useState, useEffect } from "react"
import type { Product } from "@/app/lib/types"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"
import { Heart } from "lucide-react"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/app/lib/wishlist"
import { formatCurrencyDisplay } from "@/app/lib/currency-formatter"

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/v1/store")
        const productsData = await response.json()
        setProducts(productsData)
        setFilteredProducts(productsData)

        const wishlistStatus = new Set<string>()
        for (const product of productsData) {
          const inWishlist = await isInWishlist(product.id)
          if (inWishlist) {
            wishlistStatus.add(product.id)
          }
        }
        setWishlistItems(wishlistStatus)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.productTag === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter((p) => p.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, products])

  const categories = ["all", ...new Set(products.map((p) => p.productTag))]
  const featuredProducts = products.filter((p) => p.featured)

  const handleWishlistToggle = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    try {
      if (wishlistItems.has(product.id)) {
        await removeFromWishlist(product.id)
        setWishlistItems((prev) => {
          const updated = new Set(prev)
          updated.delete(product.id)
          return updated
        })
      } else {
        await addToWishlist(product)
        setWishlistItems((prev) => new Set(prev).add(product.id))
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    }
  }

  return (
    <>
      <StoreHeader />
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured Section */}
          {featuredProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-primary mb-8">Featured Collections</h2>
              <div className="flex overflow-x-auto gap-6 pb-4">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/store/${product.id}`}>
                    <div className="flex-shrink-0 w-64 group cursor-pointer">
                      <div className="relative bg-muted rounded-lg overflow-hidden mb-4 aspect-square">
                        <img
                          src={product.productImage1 || "/placeholder.svg"}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition">
                        {product.productName}
                      </h3>
                      <p className="text-lg font-bold text-primary">₦{formatCurrencyDisplay(product.productPrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-primary mb-2">Our Collections</h1>
            <p className="text-foreground text-lg">Discover curated African luxury designs</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted text-foreground placeholder:text-muted-foreground"
            />

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? "bg-primary text-background"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground mb-4">No products found</p>
              <Button onClick={() => (setSearchQuery(""), setSelectedCategory("all"))} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/store/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative bg-muted rounded-lg overflow-hidden mb-4 aspect-square">
                      <img
                        src={product.productImage1 || "/placeholder.svg"}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => handleWishlistToggle(e, product)}
                        className="absolute top-4 right-4 p-2 bg-background/80 rounded-full hover:bg-background transition"
                      >
                        <Heart
                          size={20}
                          className={wishlistItems.has(product.id) ? "fill-accent text-accent" : "text-accent"}
                        />
                      </button>
                    </div>

                    <h3 className="font-semibold text-foreground group-hover:text-accent transition mb-2">
                      {product.productName}
                    </h3>

                    <p className="text-lg font-bold text-primary mb-3">
                      ₦{formatCurrencyDisplay(product.productPrice)}
                    </p>

                    <p className="text-sm text-muted-foreground line-clamp-2">{product.productDescription}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
