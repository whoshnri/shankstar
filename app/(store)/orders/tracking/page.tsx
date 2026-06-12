import { getOrderByNumber } from '@/lib/actions/orders';
import TrackingClient from './tracking-client';

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : null;

  return <TrackingClient initialOrder={order} />;
}
