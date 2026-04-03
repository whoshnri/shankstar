'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { useToast } from '@/lib/toast-context';
import { useMutation } from '@/hooks/use-mutation';
import { adminCreateCategory, adminUpdateCategory, adminGetCategories } from '@/lib/actions/admin';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type Category = Awaited<ReturnType<typeof adminGetCategories>>[number];


interface CategoryFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess?: () => void;
}

export function CategoryFormSheet({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormSheetProps) {
  const { addToast } = useToast();

  const mutation = useMutation(
    (data: CategoryFormData) => 
      category 
        ? adminUpdateCategory(category.id, data) 
        : adminCreateCategory(data),
    {
      onSuccess: () => {
        addToast(
          category ? 'Category updated successfully' : 'Category created successfully',
          'success'
        );
        reset();
        onClose();
        onSuccess?.();
      },
      onError: (err) => {
        addToast(err.message, 'error');
      }
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
        }
      : {
          name: '',
          description: '',
        },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[500px]">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-xl font-medium">
            {category ? 'Edit Category' : 'Add Category'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1">
          <FormField
            label="Category Name"
            placeholder="e.g., Apparel"
            {...register('name')}
            error={errors.name}
          />

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              placeholder="Category description..."
              className="w-full px-4 py-3 border border-border rounded-sm text-sm transition-all duration-300 ease-out focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 text-xs font-bold uppercase tracking-widest rounded-none border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-none transition-all"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
