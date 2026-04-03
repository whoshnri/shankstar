'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface WishlistSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function WishlistSheet({ isOpen, onClose }: WishlistSheetProps) {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const toggleChecked = (variantId: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) {
        next.delete(variantId)
      } else {
        next.add(variantId)
      }
      return next
    })
  }

  const handleRemoveSelected = () => {
    checkedIds.forEach((id) => removeItem(id))
    setCheckedIds(new Set())
  }

  const handleAddSelectedToCart = () => {
    items
      .filter((item) => checkedIds.has(item.variantId))
      .forEach((item) => {
        addItem({
          variantId: item.variantId,
          quantity: 1,
          price: item.price,
          name: item.name,
          image: item.image,
        })
        removeItem(item.variantId)
      })
    setCheckedIds(new Set())
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Wishlist</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <Checkbox
                    checked={checkedIds.has(item.variantId)}
                    onCheckedChange={() => toggleChecked(item.variantId)}
                  />
                  <div className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-sm bg-secondary">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 pb-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={checkedIds.size === 0}
              onClick={handleRemoveSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove selected
            </Button>
            <Button
              className="w-full"
              disabled={checkedIds.size === 0}
              onClick={handleAddSelectedToCart}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add selected to cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
