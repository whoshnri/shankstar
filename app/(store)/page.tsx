import { getProducts } from '@/lib/actions/products';
import { ProductGrid } from '@/components/product-grid';

export default async function Home() {
  const { products, failed } = await getProducts({ limit: 20 });

  return (
    <ProductGrid initialProducts={products} initialFailed={failed} />
  );
}
