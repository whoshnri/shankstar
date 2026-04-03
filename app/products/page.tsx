import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getProducts, getCategories } from '@/lib/actions/products';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />

      {/* Hero */}
      <section className="py-12 md:py-16 px-4 md:px-6 border-b border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-light mb-4">All Products</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our complete collection of luxury goods
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-light">
              {products.length} Products
            </h2>
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
