import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

// Mock data
const MOCK_CATEGORIES = [
  { id: '1', name: 'Apparel', slug: 'apparel', description: 'Premium clothing and outerwear' },
  { id: '2', name: 'Accessories', slug: 'accessories', description: 'Essential luxury accessories' },
  { id: '3', name: 'Footwear', slug: 'footwear', description: 'Handcrafted shoes and boots' },
  { id: '4', name: 'Watches', slug: 'watches', description: 'Luxury timepieces' },
];

const MOCK_PRODUCTS_BY_CATEGORY: Record<string, any[]> = {
  apparel: [
    {
      id: '1',
      name: 'Premium Leather Jacket',
      slug: 'premium-leather-jacket',
      basePrice: 1200,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=600&fit=crop',
      brand: 'Artisan & Co',
    },
    {
      id: '2',
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      basePrice: 350,
      image: 'https://images.unsplash.com/photo-1585364741828-f0f7f9f5ee9e?w=600&h=600&fit=crop',
      brand: 'Minimalist',
    },
    {
      id: '3',
      name: 'Tailored Wool Trousers',
      slug: 'tailored-wool-trousers',
      basePrice: 450,
      image: 'https://images.unsplash.com/photo-1617457362559-92b8e7f22f6f?w=600&h=600&fit=crop',
      brand: 'Heritage',
    },
    {
      id: '7',
      name: 'Wool Overcoat',
      slug: 'wool-overcoat',
      basePrice: 1100,
      image: 'https://images.unsplash.com/photo-1539533057440-7814a9d790f9?w=600&h=600&fit=crop',
      brand: 'Heritage',
    },
  ],
  accessories: [
    {
      id: '5',
      name: 'Silk Pocket Square',
      slug: 'silk-pocket-square',
      basePrice: 120,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
      brand: 'Artisan & Co',
    },
    {
      id: '6',
      name: 'Premium Sunglasses',
      slug: 'premium-sunglasses',
      basePrice: 550,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
      brand: 'Visionary',
    },
  ],
  footwear: [
    {
      id: '4',
      name: 'Italian Leather Shoes',
      slug: 'italian-leather-shoes',
      basePrice: 650,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop',
      brand: 'Elegante',
    },
  ],
  watches: [
    {
      id: '8',
      name: 'Luxury Watch',
      slug: 'luxury-watch',
      basePrice: 2400,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=600&fit=crop',
      brand: 'Timeless',
    },
  ],
};

const MOCK_CATEGORY_LIST = [
  { id: '1', name: 'Apparel', slug: 'apparel' },
  { id: '2', name: 'Accessories', slug: 'accessories' },
  { id: '3', name: 'Footwear', slug: 'footwear' },
  { id: '4', name: 'Watches', slug: 'watches' },
];

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  const products = MOCK_PRODUCTS_BY_CATEGORY[slug] || [];

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={MOCK_CATEGORY_LIST} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4">Category Not Found</h1>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={MOCK_CATEGORY_LIST} />

      {/* Breadcrumb */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Category Header */}
      <section className="py-12 md:py-16 px-4 md:px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground">{category.description}</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-6">No products in this category yet</p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
              >
                View All Products
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-light">
                  {products.length} Products
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
                    <p className="text-sm font-light text-foreground">
                      ${product.basePrice.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
