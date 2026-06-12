'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryFormSheet } from '@/components/admin/category-form-sheet';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { adminGetCategories, adminDeleteCategory } from '@/lib/actions/admin';

type Category = Awaited<ReturnType<typeof adminGetCategories>>[number];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCategories = async () => {
    try {
      const data = await adminGetCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await adminDeleteCategory(id);
        await loadCategories();
      } catch (err) {
        console.error('Failed to delete category', err);
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
          <h1 className="text-3xl font-light mb-1">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage product categories ({categories.length} total)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsFormOpen(true);
          }}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 w-full md:w-auto"
        >
          <Plus size={18} />
          New Category
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-6 border border-border rounded-sm card-minimal"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium text-foreground mb-1">
                {category.name}
              </h3>
              {/* <p className="text-xs text-muted-foreground">{category.slug}</p> */}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {category.description}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-sm hover:opacity-75 transition-opacity text-sm font-medium"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setDeleteId(category.id)}
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
      <CategoryFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={loadCategories}
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Products in this category will need to be recategorized."
      />
    </div>
  );
}
