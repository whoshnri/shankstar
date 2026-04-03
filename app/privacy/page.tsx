import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export const metadata = { title: 'Privacy Policy' };

export default async function PrivacyPage() {
  const categories = await getCategories();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly — such as your name, email address, phone number, and shipping address when you place an order or contact us.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to process orders, communicate with you about your purchases, improve our services, and comply with legal obligations. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">3. Cookies</h2>
            <p>We use cookies to enhance your browsing experience. See our <a href="/cookies" className="text-foreground underline underline-offset-4">Cookie Policy</a> for details.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">4. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="/contact" className="text-foreground underline underline-offset-4">our contact page</a>.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">6. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify you of significant changes by posting a notice on our site.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
