import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export const metadata = { title: 'Shipping Policy' };

export default async function ShippingPage() {
  const categories = await getCategories();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Processing Time</h2>
            <p>Orders are processed within 1–2 business days. Orders placed on weekends or public holidays will be processed the next business day.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Shipping Rates</h2>
            <ul className="space-y-2">
              <li>Standard shipping: ₦15,000.00</li>
              <li>Free shipping on orders over ₦500,000.00</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Delivery Times</h2>
            <p>Standard delivery takes 5–10 business days depending on your location. Delivery times are estimates and not guaranteed.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Tracking Your Order</h2>
            <p>Once your order ships, you will receive a confirmation with tracking information. You can also track your order from the order confirmation page.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">International Shipping</h2>
            <p>We currently ship domestically only. International shipping options will be available soon.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
