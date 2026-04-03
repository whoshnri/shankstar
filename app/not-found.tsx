import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getCategories } from '@/lib/actions/products';

export default async function NotFound() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={categories} />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-6 animate-fade-in">
          {/* Large decorative 404 */}
          <div className="relative">
            <h1 className="text-[120px] md:text-[200px] font-extralight leading-none tracking-tighter text-foreground/5 select-none pointer-events-none">
              404
            </h1>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
              <div className="bg-background/80 backdrop-blur-sm px-6 py-2 animate-slide-in-up">
                <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mt-4">
                  Page Not Found
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-6 max-w-[450px] mx-auto animate-slide-in-up delay-75">
            <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
              We can't find the page you're looking for. It might have been moved or removed from our store.
            </p>
            
            <div className="pt-4">
              <Link 
                href="/"
                role="button"
                className="inline-flex items-center justify-center px-10 py-4 border border-border text-xs uppercase tracking-widest font-medium "
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
