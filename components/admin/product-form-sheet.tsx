'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';
import { generateSKU } from '@/lib/utils';

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Required'),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  brandId: z.string().min(1, 'Required'),
  categoryId: z.string().min(1, 'Required'),
  images: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  variants: z.array(variantSchema).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
  isVisible: boolean;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  description?: string | null;
  images: string[];
  isVisible: boolean;
  variants?: Variant[];
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
  const { brands, categories, isLoading: isOptionsLoading } = useAdminOptions();

  const mutation = useMutation(
    (data: ProductFormData) =>
      product
        ? adminUpdateProduct(product.id, data)
        : adminCreateProduct(data),
    {
      onSuccess: () => {
        addToast(
          product ? 'Updated' : 'Created',
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
    control,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      basePrice: 0,
      stock: 0,
      brandId: '',
      categoryId: '',
      description: '',
      images: [],
      isVisible: true,
      variants: [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          basePrice: product.basePrice,
          stock: product.stock || 0,
          brandId: product.brand.id,
          categoryId: product.category.id,
          description: product.description || '',
          images: product.images || [],
          isVisible: product.isVisible,
          variants: product.variants?.map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            images: v.images || [],
            isVisible: v.isVisible,
          })) || [],
        });
      } else {
        reset({
          name: '',
          basePrice: 0,
          stock: 0,
          brandId: '',
          categoryId: '',
          description: '',
          images: [],
          isVisible: true,
          variants: [],
        });
      }
    }
  }, [product, reset, isOpen]);

  const onSubmit = (data: ProductFormData) => {
    const brandLabel = brands.find(b => b.value === data.brandId)?.label || 'UNK';
    const categoryLabel = categories.find(c => c.value === data.categoryId)?.label || 'UNK';

    const processedVariants = data.variants.map(v => ({
      ...v,
      sku: v.sku || generateSKU(data.name, brandLabel, categoryLabel, v.name)
    }));

    mutation.mutate({
      ...data,
      variants: processedVariants
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

  const addVariantImage = (variantIdx: number) => {
    const variants = watch('variants');
    const currentImages = variants[variantIdx].images || [];
    setValue(`variants.${variantIdx}.images`, [...currentImages, ''], { shouldDirty: true });
  };

  const updateVariantImage = (variantIdx: number, imgIdx: number, value: string) => {
    const variants = watch('variants');
    const newImages = [...(variants[variantIdx].images || [])];
    newImages[imgIdx] = value;
    setValue(`variants.${variantIdx}.images`, newImages, { shouldDirty: true });
  };

  const removeVariantImage = (variantIdx: number, imgIdx: number) => {
    const variants = watch('variants');
    const newImages = (variants[variantIdx].images || []).filter((_, i) => i !== imgIdx);
    setValue(`variants.${variantIdx}.images`, newImages, { shouldDirty: true });
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
            {/* Basic Info */}
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
                        className={`p-2 transition-colors ${field.value ? 'text-primary' : 'text-muted-foreground'
                          }`}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Brand"
                    options={brands}
                    disabled={isOptionsLoading}
                    {...register('brandId')}
                    error={errors.brandId}
                  />
                  <FormSelect
                    label="Category"
                    options={categories}
                    disabled={isOptionsLoading}
                    {...register('categoryId')}
                    error={errors.categoryId}
                  />
                </div>

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

            {/* Images */}
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
                      placeholder="URL"
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
                  <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/5 border border-dashed border-border">No images added</p>
                )}
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Variants</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendVariant({
                    name: '',
                    sku: '',
                    price: watch('basePrice') || 0,
                    stock: 0,
                    images: [],
                    isVisible: true
                  })}
                  className="h-7 text-[10px] font-bold tracking-widest uppercase"
                >
                  New
                </Button>
              </div>

              <div className="space-y-8">
                {variantFields.map((field, idx) => {
                  const variants = watch('variants');
                  const currentVariantImages = variants[idx]?.images || [];

                  return (
                    <div key={field.id} className="p-4 border border-border rounded-none bg-secondary/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground"># {idx + 1} Variant</span>
                        <div className="flex items-center gap-2">
                          <Controller
                            name={`variants.${idx}.isVisible`}
                            control={control}
                            render={({ field }) => (
                              <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={`p-1.5 ${field.value ? 'text-primary' : 'text-muted-foreground'}`}
                              >
                                {field.value ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(idx)}
                            className="text-muted-foreground h-8 w-8"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          label="Name"
                          placeholder="Small, L..."
                          {...register(`variants.${idx}.name`)}
                          error={errors.variants?.[idx]?.name}
                        />
                        <FormField
                          label="Price"
                          type="number"
                          {...register(`variants.${idx}.price`)}
                          error={errors.variants?.[idx]?.price}
                        />
                        <FormField
                          label="Stock"
                          type="number"
                          {...register(`variants.${idx}.stock`)}
                          error={errors.variants?.[idx]?.stock}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">Images</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVariantImage(idx)}
                            className="h-6 text-sm font-bold text-primary border border-border"
                          >
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentVariantImages.map((vImg, vImgIdx) => (
                            <div key={vImgIdx} className="flex gap-2">
                              <input
                                className="flex-1 h-8 px-3 border border-border rounded-none text-[11px] bg-background outline-none"
                                placeholder="URL"
                                value={vImg}
                                onChange={(e) => updateVariantImage(idx, vImgIdx, e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeVariantImage(idx, vImgIdx)}
                                className="text-muted-foreground h-8 w-8"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {variantFields.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8 bg-secondary/5 border border-dashed border-border">No variants (Simple product)</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
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
