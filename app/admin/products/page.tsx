'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { ProductFormSheet } from '@/components/admin/product-form-sheet';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import {
  adminGetProducts,
  adminGetProduct,
  adminDeleteProduct,
  adminToggleProductVisibility,
} from '@/lib/actions/admin';
import { formatPrice } from '@/lib/utils';

type Product = Awaited<ReturnType<typeof adminGetProducts>>[number];
type FullProduct = Awaited<ReturnType<typeof adminGetProduct>>;

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FullProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const loadProducts = async () => {
    try {
      const data = await adminGetProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = async (product: Product) => {
    startTransition(async () => {
      try {
        // Fetch details without unmounting characters
        const fullProduct = await adminGetProduct(product.id);
        setSelectedProduct(fullProduct);
        setIsFormOpen(true);
      } catch (err) {
        console.error('Failed to fetch product details', err);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await adminDeleteProduct(id);
        await loadProducts();
      } catch (err) {
        console.error('Failed to delete product', err);
      }
      setDeleteId(null);
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      startTransition(async () => {
        try {
          await Promise.all([...selectedIds].map((id) => adminDeleteProduct(id)));
          await loadProducts();
          setSelectedIds(new Set());
        } catch (err) {
          console.error('Failed to bulk delete products', err);
        }
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    startTransition(async () => {
      try {
        await adminToggleProductVisibility(id);
        await loadProducts();
      } catch (err) {
        console.error('Failed to toggle product visibility', err);
      }
    });
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const totalVariants = products.reduce((sum, p) => sum + p._count.variants, 0);

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light mb-1">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog ({products.length} total, {totalVariants} variants)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={18} />
          New Product
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-secondary border border-border rounded-sm">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="outline"
            onClick={handleBulkDelete}
            disabled={isPending}
            className="text-red-600 hover:bg-red-500 hover:text-white"
          >
            <Trash2 size={16} />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === products.length && products.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(products.map((p) => p.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Brand</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Variants</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => handleToggleSelect(product.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.brand.name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3">{product._count.variants}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-sm ${
                        product.isVisible
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {product.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleVisibility(product.id)}
                        disabled={isPending}
                        className="p-2 hover:bg-secondary rounded-sm transition-colors"
                        title={product.isVisible ? 'Hide product' : 'Show product'}
                      >
                        {product.isVisible ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        disabled={isPending}
                        className="p-2 hover:bg-secondary rounded-sm transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-sm transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Sheet */}
      <ProductFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={loadProducts}
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
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
