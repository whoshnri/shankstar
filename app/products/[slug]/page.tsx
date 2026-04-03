import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductDetail } from '@/components/product-detail';
import { RecommendedProduct } from '@/components/product-recommendation';
import { getProductBySlug, getRecommendations, getCategories } from '@/lib/actions/products';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [recommendations, categories] = await Promise.all([
    getRecommendations(product.id, 4),
    getCategories(),
  ]);

  // Map recommendations to RecommendedProduct shape
  const mappedRecommendations: RecommendedProduct[] = recommendations.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    image:
      r.images[0] ||
      r.variants[0]?.images[0] ||
      '/placeholder.jpg',
    brand: r.brand.name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <ProductDetail product={product} recommendations={mappedRecommendations} />
      <Footer />
    </div>
  );
}
