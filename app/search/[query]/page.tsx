import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductRecommendation, RecommendedProduct } from '@/components/product-recommendation';
import { searchProducts } from '@/lib/actions/search';
import { getCategories } from '@/lib/actions/products';
import { formatPrice } from '@/lib/utils';

interface SearchPageProps {
  params: Promise<{ query: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const q = decodeURIComponent((await params).query);

  const [{ results, recommendations }, categories] = await Promise.all([
    searchProducts(q),
    getCategories(),
  ]);

  const mappedRecommendations: RecommendedProduct[] = recommendations.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    image: product.images[0] || product.variants[0]?.images[0] || '/placeholder.jpg',
    brand: product.brand.name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {results.length > 0 ? (
            <h1 className="text-2xl md:text-3xl font-light mb-8">Results for &ldquo;{q}&rdquo;</h1>
          ) : (
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-light mb-2">No products found for &ldquo;{q}&rdquo;</h1>
              <p className="text-muted-foreground">Try a different search term</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {results.map((product) => {
              const firstVariant = product.variants[0];
              const price = firstVariant?.price ?? product.basePrice;
              const image =
                product.images[0] ??
                firstVariant?.images[0] ??
                '/placeholder.jpg';

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden bg-secondary mb-4 hover-lift">
                    <div className="aspect-square relative">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-500 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.brand.name}</p>
                  <p className="text-sm font-light text-foreground">
                    {formatPrice(price)}
                  </p>
                </Link>
              );
            })}
          </div>

          <ProductRecommendation products={mappedRecommendations} title="You might also like" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
