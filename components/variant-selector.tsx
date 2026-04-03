'use client';

import { cn } from '@/lib/utils';

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  if (variants.length <= 1 && variants[0]?.id === 'base') return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
          Select Option
        </label>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            const isOutOfStock = variant.stock === 0;

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => !isOutOfStock && onVariantChange(variant.id)}
                disabled={isOutOfStock}
                className={cn(
                  "px-6 py-2.5 text-xs  uppercase tracking-widest transition-all duration-500 border",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-transparent text-foreground hover:border-foreground",
                  isOutOfStock && "opacity-20 grayscale cursor-not-allowed border-dashed"
                )}
              >
                {variant.name}
                {isOutOfStock && <span className="ml-2 opacity-50">SOLD OUT</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full",
          (variants.find(v => v.id === selectedVariantId)?.stock || 0) > 0 ? "bg-green-500" : "bg-red-500"
        )} />
        <span className="text-xs font-bold uppercase font-light">
          {variants.find((v) => v.id === selectedVariantId)?.stock} in stock
        </span>
      </div>
    </div>
  );
}
