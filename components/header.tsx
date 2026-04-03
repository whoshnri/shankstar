'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { useWishlist } from '@/lib/wishlist-context';
import { CartSheet } from '@/components/cart-sheet';
import { WishlistSheet } from '@/components/wishlist-sheet';
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react';

interface HeaderProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
}

export function Header({ categories = [] }: HeaderProps) {
  const { cartCount } = useCart();
  const { openSearch } = useSearch();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-12">
            <Link href="/" className="text-2xl font-light tracking-wide hover:opacity-60 transition-opacity">
              LUXURY
            </Link>

            <button
              onClick={openSearch}
              className="flex-1 max-w-md"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  readOnly
                  className="w-full px-4 py-2 text-sm border border-border rounded-sm bg-background text-left cursor-pointer hover:border-primary transition-colors"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </button>


            <div className="flex items-center gap-5 flex-1 max-w-40 justify-end">
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative hover:opacity-60 transition-opacity"
                aria-label="Wishlist"
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:opacity-60 transition-opacity"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:opacity-60 transition-opacity"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="text-xl font-light tracking-wide hover:opacity-60 transition-opacity">
              LUXURY
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative hover:opacity-60 transition-opacity"
                aria-label="Wishlist"
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:opacity-60 transition-opacity"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <button
              onClick={() => {
                openSearch();
                setIsMobileMenuOpen(false);
              }}
              className="md:hidden w-full mt-6 pt-6 border-t border-border"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  readOnly
                  className="w-full px-4 py-2 text-sm border border-border rounded-sm bg-background text-left cursor-pointer hover:border-primary transition-colors"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </button>
          )}
        </div>
      </header>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistSheet isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
}
