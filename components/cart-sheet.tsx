'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatPrice } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';
import Image from 'next/image';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      addToast('Proceeding to checkout...', 'success');
      setIsCheckingOut(false);
      onClose();
      router.push('/checkout');
    }, 500);
  };

  const CartBody = (
    <>
      <div className="flex-1 overflow-y-auto py-6 border-t border-border">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button
              variant="outline"
              onClick={onClose}
              className="border border-border"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div
                key={item.productId + (item.variantId || '')}
                className="flex gap-4 pb-6 border-b border-border"
              >
                <div className="relative w-20 h-20 bg-secondary rounded-sm overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 hover:bg-secondary rounded-sm transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="p-1 hover:bg-secondary rounded-sm transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="ml-auto p-1 hover:bg-red-50 rounded-sm transition-colors text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-border pt-6 pb-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>
          <div className="flex justify-between text-lg border-t border-border pt-4">
            <span className="font-light">Total</span>
            <span className="font-medium">{formatPrice(cartTotal)}</span>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-6 bg-primary text-primary-foreground text-xs  uppercase tracking-widest rounded-none hover:shadow-lg transition-all"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full py-6 border-border text-xs hover:text-black  uppercase tracking-widest rounded-none hover:bg-secondary transition-all"
            >
              Continue Shopping
            </Button>
            <Button
              variant="ghost"
              onClick={clearCart}
              className="w-full py-3 text-red-600 text-[10px]  uppercase tracking-widest rounded-none hover:bg-red-50 hover:text-red-700 transition-all"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="flex flex-col max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-light">Your Cart</DrawerTitle>
          </DrawerHeader>
          {CartBody}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-light">Your Cart</SheetTitle>
        </SheetHeader>
        {CartBody}
      </SheetContent>
    </Sheet>
  );
}
