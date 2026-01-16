"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/lib/auth-context"
import { useRouter } from "next/navigation"
import { isAdmin } from "@/app/lib/admin-utils"
import type { Product } from "@/app/lib/types"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { uploadImage } from "@/app/lib/cloudinary"

export default function ProductManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productTag: "traditional" as "traditional" | "suit" | "senator" | "beads",
    productImages: [] as string[],
    productSizeGuide: {} as Record<string, string>,
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user.email))) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/v1/store")
        const productsData = await response.json()
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    if (user && isAdmin(user.email)) {
      fetchProducts()
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setUploading(true)

      let uploadedImages: string[] = []

      if (imageFiles.length > 0) {
        uploadedImages = await Promise.all(imageFiles.map((file) => uploadImage(file)))
      }

      const response = await fetch("/api/v1/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          productDescription: formData.productDescription,
          productPrice: Number.parseFloat(formData.productPrice),
          productTag: formData.productTag,
          productImages: uploadedImages,
          productSizeGuide: formData.productSizeGuide,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create product")
        return
      }

      // Refresh products
      const productsResponse = await fetch("/api/v1/store")
      const updatedProducts = await productsResponse.json()
      setProducts(updatedProducts)

      // Reset form
      setFormData({
        productName: "",
        productDescription: "",
        productPrice: "",
        productTag: "traditional",
        productImages: [],
        productSizeGuide: {},
      })
      setImageFiles([])
      setShowForm(false)
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to create product")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !isAdmin(user.email)) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-accent hover:underline mb-4 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-4xl font-bold text-primary">Product Management</h1>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setFormData({
                productName: "",
                productDescription: "",
                productPrice: "",
                productTag: "traditional",
                productImages: [],
                productSizeGuide: {},
              })
              setImageFiles([])
            }}
            className="bg-primary text-background hover:opacity-90 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Product
          </Button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Product Name</label>
                    <Input
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Price</label>
                    <Input
                      name="productPrice"
                      type="number"
                      step="0.01"
                      value={formData.productPrice}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    name="productDescription"
                    value={formData.productDescription}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Product Tag</label>
                  <select
                    name="productTag"
                    value={formData.productTag}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="traditional">Traditional</option>
                    <option value="suit">Suit</option>
                    <option value="senator">Senator</option>
                    <option value="beads">Beads</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Product Images (up to 3)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mt-1 p-2 border border-border rounded bg-background text-foreground"
                    disabled={uploading}
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-sm text-accent mt-2">{imageFiles.length} file(s) selected</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-primary text-background hover:opacity-90"
                  >
                    {uploading ? "Uploading..." : "Add Product"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        {loadingProducts ? (
          <p className="text-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-foreground text-center">No products yet. Add your first product!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tag</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Featured</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted transition">
                    <td className="py-3 px-4 text-sm text-foreground">{product.productName}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{product.productTag}</td>
                    <td className="py-3 px-4 text-sm text-foreground font-medium">${product.productPrice}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={product.featured ? "text-accent" : "text-muted-foreground"}>
                        {product.featured ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
