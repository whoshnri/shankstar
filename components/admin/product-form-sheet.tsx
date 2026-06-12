'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { FormSelect } from '@/components/form-select';
import { useToast } from '@/lib/toast-context';
import { useMutation } from '@/hooks/use-mutation';
import { useAdminOptions } from '@/hooks/use-admin-options';
import { adminCreateProduct, adminUpdateProduct } from '@/lib/actions/admin';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';

const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().min(1, 'Required'),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  category: { id: string; name: string };
  description?: string | null;
  images: string[];
  isVisible: boolean;
}

interface ProductFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductFormSheet({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormSheetProps) {
  const { addToast } = useToast();
  const { categories, isLoading: isOptionsLoading } = useAdminOptions();

  const mutation = useMutation(
    (data: ProductFormData) =>
      product
        ? adminUpdateProduct(product.id, data)
        : adminCreateProduct(data),
    {
      onSuccess: () => {
        addToast(product ? 'Updated' : 'Created', 'success');
        reset();
        onClose();
        onSuccess?.();
      },
      onError: (err) => {
        addToast(err.message, 'error');
      },
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      basePrice: 0,
      stock: 0,
      categoryId: '',
      description: '',
      images: [],
      isVisible: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          basePrice: product.basePrice,
          stock: product.stock || 0,
          categoryId: product.category.id,
          description: product.description || '',
          images: product.images || [],
          isVisible: product.isVisible,
        });
      } else {
        reset({
          name: '',
          basePrice: 0,
          stock: 0,
          categoryId: '',
          description: '',
          images: [],
          isVisible: true,
        });
      }
    }
  }, [product, reset, isOpen]);

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate({
      ...data,
      images: data.images.filter(Boolean),
    });
  };

  const productImages = watch('images') || [];

  const addProductImage = () => {
    setValue('images', [...productImages, ''], { shouldDirty: true });
  };

  const removeProductImage = (index: number) => {
    setValue('images', productImages.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const updateProductImage = (index: number, value: string) => {
    const newImages = [...productImages];
    newImages[index] = value;
    setValue('images', newImages, { shouldDirty: true });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[500px] overflow-y-auto p-0 rounded-none border-l border-border shadow-none">
        <div className="flex flex-col h-full bg-background">
          <SheetHeader className="p-6 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="text-lg font-medium">
              {product ? 'Edit Product' : 'Add Product'}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-10 flex-1 overflow-y-auto pb-32">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Basic Info</h3>

              <div className="space-y-4">
                <FormField
                  label="Name"
                  placeholder="Product name"
                  {...register('name')}
                  error={errors.name}
                  className="rounded-none border-border"
                />

                <Controller
                  name="isVisible"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between p-4 border border-border rounded-none bg-secondary/5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Visible</p>
                        <p className="text-xs text-muted-foreground">Show in store</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`p-2 transition-colors ${field.value ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {field.value ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  )}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Brief details..."
                    className="w-full px-3 py-2 border border-border rounded-none text-sm focus:border-primary resize-none min-h-[100px] bg-secondary/5 outline-none"
                    {...register('description')}
                  />
                </div>

                <FormSelect
                  label="Category"
                  options={categories}
                  disabled={isOptionsLoading}
                  {...register('categoryId')}
                  error={errors.categoryId}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Price (₦)"
                    type="number"
                    placeholder="0.00"
                    {...register('basePrice')}
                    error={errors.basePrice}
                  />
                  <FormField
                    label="Stock"
                    type="number"
                    placeholder="0"
                    {...register('stock')}
                    error={errors.stock}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Images</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addProductImage}
                  className="h-7 text-[10px] font-bold tracking-widest uppercase"
                >
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {productImages.map((img, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 h-10 px-3 border border-border rounded-none text-sm bg-secondary/5 outline-none"
                      placeholder="Image URL"
                      value={img}
                      onChange={(e) => updateProductImage(idx, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProductImage(idx)}
                      className="text-muted-foreground h-10 w-10 shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                {productImages.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/5 border border-dashed border-border">
                    No images added
                  </p>
                )}
              </div>
            </div>
          </form>

          <div className="p-6 border-t border-border bg-background sticky bottom-0 z-10 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 text-xs font-bold uppercase rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-none"
            >
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
