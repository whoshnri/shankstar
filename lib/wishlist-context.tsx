'use client'

import React, { createContext, useContext, useState } from 'react'

export interface WishlistItem {
  variantId: string
  productId: string
  name: string
  image: string
  price: number
  slug: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (variantId: string) => void
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (variantId: string) => boolean
  clearWishlist: () => void
}

const COOKIE_KEY = 'wishlist'
const MAX_AGE = 60 * 60 * 24 * 30

function readCookie(): WishlistItem[] {
  if (typeof document === 'undefined') return []
  try {
    const match = document.cookie.match(/(?:^|;\s*)wishlist=([^;]*)/)
    if (!match) return []
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return []
  }
}

function writeCookie(items: WishlistItem[]): void {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => readCookie())

  const addItem = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.variantId === item.variantId)) return prev
      const next = [...prev, item]
      writeCookie(next)
      return next
    })
  }

  const removeItem = (variantId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.variantId !== variantId)
      writeCookie(next)
      return next
    })
  }

  const toggleItem = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.variantId === item.variantId)
      const next = exists
        ? prev.filter((i) => i.variantId !== item.variantId)
        : [...prev, item]
      writeCookie(next)
      return next
    })
  }

  const isInWishlist = (variantId: string) =>
    items.some((i) => i.variantId === variantId)

  const clearWishlist = () => {
    setItems([])
    writeCookie([])
  }

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
