'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
}

interface ProductRecommendationProps {
  products: RecommendedProduct[];
  title?: string;
  className?: string;
  onItemClick?: () => void;
}

export function ProductRecommendation({
  products,
  title = 'You might also like',
  className,
  onItemClick,
}: ProductRecommendationProps) {
  const items = products.slice(0, 9);

  if (items.length === 0) return null;

  return (
    <section className={cn('py-8 ', className)}>
      {title ? (
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
          {title}
        </h2>
      ) : null}
      <div className="grid grid-cols-3 gap-1">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/${product.slug}`}
            onClick={onItemClick}
            className="group"
          >
            <div className="relative overflow-hidden bg-secondary aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:opacity-90 transition-opacity duration-300"
                sizes="33vw"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
