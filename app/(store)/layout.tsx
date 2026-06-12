import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { getCategories } from '@/lib/actions/products';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, failed: categoriesFailed } = await getCategories();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header — self-start fixes sticky inside flex column */}
      <div className="md:hidden sticky top-0 z-50 w-full self-start">
        <Header categories={categories} categoriesFailed={categoriesFailed} />
      </div>

      {/* Desktop Sidebar — fixed, offset main with md:ml-64 */}
      <div className="hidden md:block">
        <Sidebar categories={categories} categoriesFailed={categoriesFailed} />
      </div>

      <main className="flex-1 min-w-0 md:ml-64 p-1 h-full relative md:p-2">
        {children}
      </main>
    </div>
  );
}
