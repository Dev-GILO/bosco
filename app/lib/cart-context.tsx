"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { CartItem } from "./types"

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.productId === newItem.productId &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor === newItem.selectedColor,
      )

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === newItem.productId &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor === newItem.selectedColor
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        )
      }

      return [...prevItems, newItem]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setItems((prevItems) => prevItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
