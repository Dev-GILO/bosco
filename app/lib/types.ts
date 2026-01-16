export interface Product {
  id: string
  productName: string
  productDescription: string
  productPrice: number
  productImage1: string
  productImage2?: string
  productImage3?: string
  productTag: "traditional" | "suit" | "senator" | "beads"
  productSizeGuide?: Record<string, string>
  featured: boolean
  creationDate: Date
}

export interface CartItem {
  productImage: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  shippingAddress: string
  shippingPhone: string
  deliveryType: "waybill" | "pickup"
  notes?: string
  itemPrice: number // Price before shipping
  totalPrice?: number // Price after shipping fee added
  shippingFee?: number // Added shipping fee field
  status: "pending" | "processing" | "delivered" // Simplified status options
  settledByPaystack: boolean
  createdAt: Date
}

export interface User {
  uid: string
  username?: string
  email: string
  phone?: string // Added phone field
  deliveryAddress?: string // Added delivery address field
  accountCreatedAt: Date
}

export interface OrderData {
  totalOrders: number
  lastUpdated: Date
}
