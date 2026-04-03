'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  brand?: string;
}

interface ProductRecommendationProps {
  products: RecommendedProduct[];
  title?: string;
}

export function ProductRecommendation({ products, title = 'You might also like' }: ProductRecommendationProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-light mb-8 text-foreground">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative overflow-hidden bg-secondary mb-4 hover-lift">
              <div className="aspect-square relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                />
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
            )}
            <p className="text-sm font-light text-foreground">
              {formatPrice(product.basePrice)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
