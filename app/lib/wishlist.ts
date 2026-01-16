import { openDB } from "idb"
import type { Product } from "./types"

const DB_NAME = "BoscoClothings"
const WISHLIST_STORE = "wishlist"

async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(WISHLIST_STORE)) {
        db.createObjectStore(WISHLIST_STORE, { keyPath: "id" })
      }
    },
  })
}

export async function addToWishlist(product: Product) {
  const db = await initDB()
  await db.add(WISHLIST_STORE, product)
}

export async function removeFromWishlist(productId: string) {
  const db = await initDB()
  await db.delete(WISHLIST_STORE, productId)
}

export async function getWishlist(): Promise<Product[]> {
  const db = await initDB()
  return db.getAll(WISHLIST_STORE)
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const db = await initDB()
  const item = await db.get(WISHLIST_STORE, productId)
  return !!item
}

export async function clearWishlist() {
  const db = await initDB()
  await db.clear(WISHLIST_STORE)
}
