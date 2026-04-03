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
import { adminCreateBrand, adminUpdateBrand } from '@/lib/actions/admin';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface BrandFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSuccess?: () => void;
}

export function BrandFormSheet({
  isOpen,
  onClose,
  brand,
  onSuccess,
}: BrandFormSheetProps) {
  const { addToast } = useToast();

  const mutation = useMutation(
    (data: BrandFormData) => 
      brand 
        ? adminUpdateBrand(brand.id, data) 
        : adminCreateBrand(data),
    {
      onSuccess: () => {
        addToast(
          brand ? 'Brand updated successfully' : 'Brand created successfully',
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
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: brand
      ? {
          name: brand.name,
          description: brand.description || '',
        }
      : {
          name: '',
          description: '',
        },
  });

  const onSubmit = (data: BrandFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[500px]">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-xl font-medium">
            {brand ? 'Edit Brand' : 'Add Brand'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 flex-1">
          <FormField
            label="Brand Name"
            placeholder="e.g., Artisan & Co"
            {...register('name')}
            error={errors.name}
          />

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              placeholder="Brand description..."
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
