'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/lib/search-context';
import { X, Search } from 'lucide-react';

export function SearchOverlay() {
  const router = useRouter();
  const { isOpen, closeSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center justify-start pt-12 md:pt-20 px-4">
        <button
          onClick={closeSearch}
          className="absolute top-6 right-6 p-2 hover:opacity-60 transition-opacity"
          aria-label="Close search"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSearch} className="w-full mt-10 sm:mt-0 max-w-2xl animate-slide-in-up">
          <div className="relative">
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg border border-border rounded-sm bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 ease-out"
            />
            <button
              type="submit"
              className="absolute right-6 top-1/2 -translate-y-1/2 hover:opacity-60 transition-opacity"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
          </div>
        </form>

        <p className="text-sm hidden md:block text-muted-foreground mt-8">
          Press <kbd className="px-2 py-1 border border-border rounded-sm text-xs font-medium">ESC</kbd> to close
        </p>
        <button onClick={closeSearch} className='border border border text-lg p-4 w-full md:hidden mt-4'>
          Close
        </button>
      </div>
    </div>
  );
}
