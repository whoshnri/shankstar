import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export const metadata = { title: 'Cookie Policy' };

export default async function CookiesPage() {
  const categories = await getCategories();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <h1 className="text-3xl md:text-4xl font-light mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Cookies We Use</h2>
            <ul className="space-y-2 list-none">
              <li><span className="text-foreground font-medium">Essential cookies</span> — Required for the site to function, such as your shopping cart and wishlist.</li>
              <li><span className="text-foreground font-medium">Analytics cookies</span> — Help us understand how visitors interact with our site so we can improve it.</li>
              <li><span className="text-foreground font-medium">Preference cookies</span> — Remember your settings and choices across visits.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the site.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-foreground mb-3">Third-Party Cookies</h2>
            <p>We may use third-party services (such as analytics providers) that set their own cookies. We do not control these cookies.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
