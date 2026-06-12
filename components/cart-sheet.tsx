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

function CartItemRow({
  item,
  compact,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  compact?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const lineTotal = item.price * item.quantity;

  if (compact) {
    return (
      <div className="flex gap-2.5 py-2.5 border-b border-border last:border-b-0">
        <div className="relative w-12 h-12 bg-secondary overflow-hidden shrink-0">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
              {item.name}
            </h3>
            <p className="text-xs font-medium shrink-0">{formatPrice(lineTotal)}</p>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={onDecrease}
                className="p-1 hover:bg-secondary rounded-sm transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center text-xs tabular-nums">{item.quantity}</span>
              <button
                onClick={onIncrease}
                className="p-1 hover:bg-secondary rounded-sm transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              onClick={onRemove}
              className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
              aria-label="Remove item"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 pb-6 border-b border-border">
      <div className="relative w-20 h-20 bg-secondary rounded-sm overflow-hidden shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{formatPrice(item.price)}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrease}
            className="p-1 hover:bg-secondary rounded-sm transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm">{item.quantity}</span>
          <button
            onClick={onIncrease}
            className="p-1 hover:bg-secondary rounded-sm transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onRemove}
            className="ml-auto p-1 hover:bg-red-50 rounded-sm transition-colors text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      addToast('Proceeding to checkout...', 'success');
      setIsCheckingOut(false);
      onClose();
      router.push('/checkout');
    }, 500);
  };

  const itemProps = (item: (typeof items)[number]) => ({
    item,
    onDecrease: () =>
      updateQuantity(item.productId, Math.max(1, item.quantity - 1)),
    onIncrease: () => updateQuantity(item.productId, item.quantity + 1),
    onRemove: () => removeItem(item.productId),
  });

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="flex flex-col max-h-[92dvh] p-0 gap-0">
          <DrawerHeader className="shrink-0 px-4 py-4 border-b border-border text-left">
            <DrawerTitle className="text-base font-light flex items-center justify-between">
              <span>Your Cart</span>
              {items.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
                <Button variant="outline" onClick={onClose} className="h-9 px-4 text-xs border border-border">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <CartItemRow key={item.productId} compact {...itemProps(item)} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="shrink-0 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-base font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Shipping calculated at checkout</p>

              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full h-10 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-none"
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </Button>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className="text-[10px] uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[500px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-2xl font-light">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 border-t border-border">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" onClick={onClose} className="border border-border">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <CartItemRow key={item.productId} {...itemProps(item)} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 pt-6 pb-4 space-y-4">
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
                className="w-full py-6 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-none hover:shadow-lg transition-all"
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full py-6 border-border text-xs hover:text-black uppercase tracking-widest rounded-none hover:bg-secondary transition-all"
              >
                Continue Shopping
              </Button>
              <Button
                variant="ghost"
                onClick={clearCart}
                className="w-full py-3 text-red-600 text-[10px] uppercase tracking-widest rounded-none hover:bg-red-50 hover:text-red-700 transition-all"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
