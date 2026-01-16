// IndexedDB utilities for cart persistence with image support
const DB_NAME = "bosco_clothings"
const STORE_NAME = "cart"
const DB_VERSION = 1

let db: IDBDatabase

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "productId" })
      }
    }
  })
}

export const addToCart = async (item: {
  productId: string
  productName: string
  productPrice: number
  productImage?: string // ✅ Added image support
  quantity: number
  selectedSize?: string
  selectedColor?: string
}) => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  const existingItem = await new Promise<any>((resolve) => {
    const request = store.get(item.productId)
    request.onsuccess = () => resolve(request.result)
  })

  if (existingItem) {
    // Update quantity but preserve the image and other details
    existingItem.quantity += item.quantity
    // Update image if new one is provided
    if (item.productImage) {
      existingItem.productImage = item.productImage
    }
    store.put(existingItem)
  } else {
    // Add new item with all details including image
    store.add({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      productImage: item.productImage || "", // Store image URL
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    })
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}

export const getCartItems = async () => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readonly")
  const store = transaction.objectStore(STORE_NAME)

  return new Promise<any[]>((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const removeFromCart = async (productId: string) => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  store.delete(productId)

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}

export const clearCart = async () => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  store.clear()

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}

export const updateCartItem = async (productId: string, quantity: number) => {
  const database = await initDB()
  const transaction = database.transaction([STORE_NAME], "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  const item = await new Promise<any>((resolve) => {
    const request = store.get(productId)
    request.onsuccess = () => resolve(request.result)
  })

  if (item) {
    item.quantity = quantity
    if (quantity > 0) {
      store.put(item)
    } else {
      store.delete(productId)
    }
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}