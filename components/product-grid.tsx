'use client';

import { useState, useCallback } from 'react';
import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/actions/products';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

interface ProductGridProps {
  initialProducts: any[];
  initialFailed?: boolean;
}

function getProductGridClasses(): string {
  return 'grid-cols-3 lg:grid-cols-4';
}

export function ProductGrid({ initialProducts, initialFailed = false }: ProductGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    initialFailed ? "Couldn't load products. Please try again." : null,
  );
  const [hasMore, setHasMore] = useState(
    !initialFailed && initialProducts.length === ITEMS_PER_PAGE,
  );
  const [skip, setSkip] = useState(ITEMS_PER_PAGE);

  const fetchMoreProducts = useCallback(async () => {
    setIsLoadingMore(true);
    setLoadError(null);

    const { products: newProducts, failed } = await getProducts({
      limit: ITEMS_PER_PAGE,
      skip,
    });

    if (failed) {
      setLoadError("Couldn't load more products. Please try again.");
    } else {
      setProducts((prev) => [...prev, ...newProducts]);
      setSkip((prev) => prev + ITEMS_PER_PAGE);
      setHasMore(newProducts.length === ITEMS_PER_PAGE);
    }

    setIsLoadingMore(false);
  }, [skip]);

  if (loadError && products.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs uppercase tracking-widest text-foreground hover:opacity-70 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.length > 0 ? (
        <>
          <div className={cn('grid gap-1', getProductGridClasses())}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center gap-2 pt-8 pb-12">
              {loadError && (
                <p className="text-xs text-muted-foreground">{loadError}</p>
              )}
              <button
                onClick={fetchMoreProducts}
                disabled={isLoadingMore}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'View More'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No products found.</p>
        </div>
      )}
    </div>
  );
}
