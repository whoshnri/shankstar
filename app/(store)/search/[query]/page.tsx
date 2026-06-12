import { ProductCard } from '@/components/product-card';
import { ProductRecommendation, RecommendedProduct } from '@/components/product-recommendation';
import { searchProducts } from '@/lib/actions/search';

interface SearchPageProps {
  params: Promise<{ query: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const q = decodeURIComponent((await params).query);

  const { results, recommendations, failed } = await searchProducts(q);

  const mappedRecommendations: RecommendedProduct[] = recommendations.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: Number(product.basePrice),
    image: product.images[0] || '/placeholder.jpg',
  }));

  return (
    <div className="max-w-7xl mx-auto px-1 md:px-6 py-6 md:py-20">
      {failed && (
        <p className="mb-6 px-3 text-sm text-muted-foreground">
          Search is temporarily unavailable. Please try again in a moment.
        </p>
      )}
      {results.length > 0 ? (
        <h1 className="px-3 text-xl md:text-3xl font-light mb-4 md:mb-8">
          Results for &ldquo;{q}&rdquo;
        </h1>
      ) : (
        <div className="mb-6 px-3">
          <h1 className="text-xl md:text-3xl font-light mb-2">
            No products found for &ldquo;{q}&rdquo;
          </h1>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-1">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="px-3 md:px-0">
        <ProductRecommendation products={mappedRecommendations} title="You might also like" />
      </div>
    </div>
  );
}
