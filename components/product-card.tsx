import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    basePrice: number | string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0] ?? '/placeholder.jpg';

  return (
    <Link href={`/${product.slug}`} className="group">
      <div className="relative overflow-hidden bg-secondary">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-300 ease-out"
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </div>
    </Link>
  );
}
