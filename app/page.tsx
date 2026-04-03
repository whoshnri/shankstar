import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getFeaturedProducts, getCategories } from '@/lib/actions/products';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default async function Home() {
  const [products, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <p className="text-sm font-medium text-muted-foreground mb-4">New Collection</p>
            <h1 className="text-4xl md:text-6xl font-light mb-6 text-foreground">
              Curated Luxury
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Timeless pieces selected for those who appreciate quality, elegance, and simplicity
            </p>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 md:py-20 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-light">Featured Collection</h2>
            <Link
              href="/products"
              className="text-sm p-3 border border-border font-medium hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => {
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
        </div>
      </section>

      <Footer />
    </div>
  );
}
