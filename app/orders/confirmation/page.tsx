import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { getOrderByNumber } from '@/lib/actions/orders';
import { getCategories } from '@/lib/actions/products';
import { formatPrice } from '@/lib/utils';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const [order, categories] = await Promise.all([
    orderNumber ? getOrderByNumber(orderNumber) : Promise.resolve(null),
    getCategories(),
  ]);

  if (!orderNumber || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={categories} />
        <div className="flex-1 py-20 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4">Order not found</h1>
            <p className="text-muted-foreground mb-8">We couldn&apos;t find the order you&apos;re looking for.</p>
            <Link href="/">
              <Button variant="outline" className="border border-border">Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const estimatedDelivery = new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />

      <div className="flex-1 py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-4">Thank You</h1>
            <p className="text-xl text-muted-foreground">Your order has been placed successfully.</p>
          </div>

          {/* Order summary */}
          <div className="border border-border rounded-sm p-8 mb-8 space-y-6">
            {/* Order number + delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-xl font-medium text-foreground">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="text-lg font-light text-foreground">{estimatedDelivery}</p>
              </div>
            </div>

            {/* Customer info */}
            {order.customer && (
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-3">Shipping To</p>
                <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                {order.customer.address && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.customer.address}
                    {order.customer.city && `, ${order.customer.city}`}
                    {order.customer.state && `, ${order.customer.state}`}
                    {order.customer.zip && ` ${order.customer.zip}`}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{order.customer.email}</p>
              </div>
            )}

            {/* Order items */}
            {order.items && order.items.length > 0 && (
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-3">Items Ordered</p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium">
                          {item.variant?.product?.name ?? 'Product'}
                        </p>
                        {item.variant && (
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-border pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Confirmation details have been sent to your email</p>
            </div>
          </div>

          {/* Next steps */}
          <div className="mb-8 text-left max-w-md mx-auto">
            <h2 className="text-lg font-light mb-4">What happens next?</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-medium text-foreground min-w-6">1.</span>
                <span>You&apos;ll receive a confirmation email shortly</span>
              </li>
              <li className="flex gap-3">
                <span className="font-medium text-foreground min-w-6">2.</span>
                <span>Your order will be processed and packed</span>
              </li>
              <li className="flex gap-3">
                <span className="font-medium text-foreground min-w-6">3.</span>
                <span>You&apos;ll receive tracking information</span>
              </li>
              <li className="flex gap-3">
                <span className="font-medium text-foreground min-w-6">4.</span>
                <span>Your item will arrive within 7-10 business days</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href={`/orders/tracking?orderNumber=${order.orderNumber}`} className="w-full md:w-auto">
              <Button className="w-full py-6 bg-primary text-primary-foreground text-xs  uppercase tracking-widest rounded-none hover:shadow-lg transition-all">
                Track Order
              </Button>
            </Link>
            <Link href="/" className="w-full md:w-auto">
              <Button variant="outline" className="w-full py-6 border-border text-xs  uppercase tracking-widest transition-all">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
