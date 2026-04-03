import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export const metadata = { title: 'Terms of Service' };

export default async function TermsPage() {
  const categories = await getCategories();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">2. Use of the Site</h2>
            <p>You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of others. You must not misuse our services or attempt to gain unauthorised access to any part of the site.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">3. Orders and Payments</h2>
            <p>All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any order at our discretion. Prices are subject to change without notice.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">4. Intellectual Property</h2>
            <p>All content on this site — including text, images, logos, and design — is the property of Luxury Storefront and may not be reproduced without written permission.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">5. Limitation of Liability</h2>
            <p>We are not liable for any indirect, incidental, or consequential damages arising from your use of our site or products, to the fullest extent permitted by law.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">6. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
