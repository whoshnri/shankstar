'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useSearch } from '@/lib/search-context';
import { ShoppingBag, Search, Instagram, RefreshCw } from 'lucide-react';
import { FaPinterest } from 'react-icons/fa';
import { CartSheet } from '@/components/cart-sheet';

interface SidebarProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
  categoriesFailed?: boolean;
}

export function Sidebar({ categories = [], categoriesFailed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const { openSearch } = useSearch();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen flex flex-col p-8 overflow-y-auto border-r border-border/40 bg-background">
        <Link href="/" className="mb-12 block">
          <h1 className="text-3xl font-serif font-light tracking-tight leading-tight uppercase">
            SUPERVILLAIN
          </h1>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={openSearch}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-foreground text-background text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={cn(
              "text-[10px] sm:text-xs uppercase tracking-wider hover:text-blue-500 transition-colors py-0.5",
              pathname === "/" ? "text-blue-500 font-medium" : "text-muted-foreground/80"
            )}
          >
            All Works
          </Link>

          {categoriesFailed ? (
            <div className="flex items-center gap-2 py-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground/80">
                Couldn&apos;t load categories
              </p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label="Retry loading categories"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className={cn(
                  "text-[10px] sm:text-xs uppercase tracking-wider hover:text-blue-500 transition-colors py-0.5",
                  pathname === `/${category.slug}` ? "text-blue-500 font-medium" : "text-muted-foreground/80"
                )}
              >
                {category.name}
              </Link>
            ))
          )}
          
          <div className="mt-8 flex flex-col gap-1">
            <Link href="/bio" className="text-[10px] sm:text-xs uppercase tracking-wider hover:text-blue-500 transition-colors py-0.5 text-muted-foreground/80">
              Bio
            </Link>
            <Link href="/mailing-list" className="text-[10px] sm:text-xs uppercase tracking-wider hover:text-blue-500 transition-colors py-0.5 text-muted-foreground/80">
              Mailing List
            </Link>
            <Link href="/contact" className="text-[10px] sm:text-xs uppercase tracking-wider hover:text-blue-500 transition-colors py-0.5 text-muted-foreground/80">
              Contact
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <Link 
              href="https://www.instagram.com/vinyloncloth/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram size={18} />
            </Link>
            <Link 
              href="https://pinterest.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaPinterest size={18} />
            </Link>
          </div>
        </nav>
      </aside>

      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
