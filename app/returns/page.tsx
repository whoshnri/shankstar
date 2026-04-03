import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export const metadata = { title: 'Returns & Refunds' };

export default async function ReturnsPage() {
  const categories = await getCategories();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Returns &amp; Refunds</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Return Window</h2>
            <p>We accept returns within 14 days of delivery. Items must be unused, in their original condition, and in original packaging.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">How to Return</h2>
            <p>To initiate a return, contact us via our <a href="/contact" className="text-foreground underline underline-offset-4">contact page</a> with your order number and reason for return. We will provide return instructions within 1–2 business days.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Refunds</h2>
            <p>Once we receive and inspect your return, we will process your refund within 5–7 business days. Refunds are issued to the original payment method.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Non-Returnable Items</h2>
            <p>Final sale items, gift cards, and items marked as non-returnable at the time of purchase cannot be returned.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Damaged or Incorrect Items</h2>
            <p>If you received a damaged or incorrect item, please contact us immediately. We will arrange a replacement or full refund at no cost to you.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
