import { getOrderByNumber } from '@/lib/actions/orders';
import { getCategories } from '@/lib/actions/products';
import TrackingClient from './tracking-client';

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { orderNumber } = await searchParams;
  
  const [order, categories] = await Promise.all([
    orderNumber ? getOrderByNumber(orderNumber) : Promise.resolve(null),
    getCategories(),
  ]);

  return <TrackingClient initialOrder={order} categories={categories} />;
}
