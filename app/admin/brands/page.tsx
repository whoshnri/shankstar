'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { BrandFormSheet } from '@/components/admin/brand-form-sheet';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { adminGetBrands, adminDeleteBrand } from '@/lib/actions/admin';

type Brand = Awaited<ReturnType<typeof adminGetBrands>>[number];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadBrands = async () => {
    try {
      const data = await adminGetBrands();
      setBrands(data);
    } catch (err) {
      console.error('Failed to load brands', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await adminDeleteBrand(id);
        await loadBrands();
      } catch (err) {
        console.error('Failed to delete brand', err);
      }
      setDeleteId(null);
    });
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light mb-1">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manage brands ({brands.length} total)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBrand(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={18} />
          New Brand
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="p-6 border border-border rounded-sm card-minimal"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-1">
                {brand.name}
              </h3>
              <p className="text-xs text-muted-foreground">{brand.slug}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {brand.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(brand)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-sm hover:opacity-75 transition-opacity text-sm font-medium"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setDeleteId(brand.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-sm hover:opacity-75 transition-opacity text-sm font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Sheet */}
      <BrandFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedBrand(null);
        }}
        brand={selectedBrand}
        onSuccess={loadBrands}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteId !== null}
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
          }
        }}
        onCancel={() => setDeleteId(null)}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? Products from this brand will need to be reassigned."
      />
    </div>
  );
}
