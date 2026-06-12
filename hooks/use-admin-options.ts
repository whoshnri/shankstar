import { useState, useEffect } from 'react';
import { adminGetCategories } from '@/lib/actions/admin';

export function useAdminOptions() {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminGetCategories();
        setCategories(
          data.map((cat) => ({
            value: cat.id,
            label: cat.name,
          })),
        );
      } catch (err) {
        console.error('Failed to load admin options', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return { categories, isLoading };
}
