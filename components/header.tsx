'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { CartSheet } from '@/components/cart-sheet';
import { ShoppingBag, Menu, X, Search, RefreshCw } from 'lucide-react';

interface HeaderProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
  categoriesFailed?: boolean;
}

export function Header({ categories = [], categoriesFailed = false }: HeaderProps) {
  const router = useRouter();
  const { cartCount } = useCart();
  const { openSearch } = useSearch();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between gap-12">
            <Link href="/" className="text-2xl font-light tracking-wide hover:opacity-60 transition-opacity">
              SUPERVILLAIN
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
              SUPERVILLAIN
            </Link>

            <div className="flex items-center gap-3">
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
            <div className="md:hidden w-full mt-6 pt-6 border-t border-border flex flex-col gap-4">
              <button
                onClick={() => {
                  openSearch();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full"
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

              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm uppercase tracking-wider py-2 border-b border-border/50"
                >
                  All Works
                </Link>
                {categoriesFailed ? (
                  <div className="flex items-center gap-2 py-2 border-b border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Couldn&apos;t load categories
                    </p>
                    <button
                      type="button"
                      onClick={() => router.refresh()}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      aria-label="Retry loading categories"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/${category.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm uppercase tracking-wider py-2 border-b border-border/50"
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
