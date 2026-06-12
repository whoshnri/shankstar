import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
import { ProductGrid } from '@/components/product-grid';
import { getProductBySlug, getRecommendations, getAdjacentProducts, getCategoryBySlug, getProducts } from '@/lib/actions/products';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const [category, product] = await Promise.all([
    getCategoryBySlug(slug),
    getProductBySlug(slug),
  ]);

  if (category) {
    return {
      title: `${category.name} | SUPERVILLAIN`,
      description: category.description || `Browse our collection of ${category.name}`,
    };
  }

  if (product) {
    return {
      title: `${product.name} | SUPERVILLAIN`,
      description: product.description || `Buy ${product.name} at SUPERVILLAIN`,
    };
  }

  return {
    title: 'Not Found | SUPERVILLAIN',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check if it's a category first
  const category = await getCategoryBySlug(slug);

  if (category) {
    const { products, failed } = await getProducts({ categorySlug: slug, limit: 20 });
    return <ProductGrid initialProducts={products} initialFailed={failed} />;
  }

  // If not a category, check if it's a product
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [recommendations, adjacent] = await Promise.all([
    getRecommendations(product.id, 9),
    getAdjacentProducts(product.id, product.categoryId),
  ]);

  // Map recommendations to RecommendedProduct shape
  const mappedRecommendations = recommendations.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    image: r.images[0] || '/placeholder.jpg',
  }));

  return (
    <ProductDetail 
      product={product} 
      recommendations={mappedRecommendations as any} 
      prevSlug={adjacent.prevSlug}
      nextSlug={adjacent.nextSlug}
    />
  );
}
