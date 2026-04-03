import { useState, useEffect } from 'react';
import { adminGetBrands, adminGetCategories } from '@/lib/actions/admin';

export function useAdminOptions() {
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [b, c] = await Promise.all([adminGetBrands(), adminGetCategories()]);
        
        setBrands(b.map(brand => ({
          value: brand.id,
          label: brand.name
        })));
        
        setCategories(c.map(cat => ({
          value: cat.id,
          label: cat.name
        })));
      } catch (err) {
        console.error('Failed to load admin options', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return { brands, categories, isLoading };
}
