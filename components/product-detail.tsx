'use client';

import { useState } from 'react';
import { ProductRecommendation, RecommendedProduct } from '@/components/product-recommendation';
import { VariantSelector, Variant } from '@/components/variant-selector';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, cn } from '@/lib/utils';

interface DBVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  images: string[];
  isVisible: boolean;
}

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  stock: number;
  images: string[];
  brand: { name: string };
  category: { name: string };
  variants: DBVariant[];
}

interface ProductDetailProps {
  product: DBProduct;
  recommendations: RecommendedProduct[];
}

export function ProductDetail({ product, recommendations }: ProductDetailProps) {
  // Create a virtual "Base" variant to include in the selection
  const baseVariant: Variant = {
    id: 'base',
    name: 'Standard',
    sku: 'BASE',
    price: product.basePrice,
    stock: product.stock,
  };

  const variants: Variant[] = [
    baseVariant,
    ...product.variants
      .filter((v) => v.isVisible)
      .map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
      })),
  ];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0].id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const dbVariant = product.variants.find((v) => v.id === selectedVariantId);

  // Determine images: Variant specific images first, then product images as fallback
  const displayImages = 
    (dbVariant?.images && dbVariant.images.length > 0)
      ? dbVariant.images
      : (product.images.length > 0 ? product.images : ['/placeholder.jpg']);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      addItem({
        productId: product.id,
        variantId: selectedVariant.id === 'base' ? undefined : selectedVariant.id,
        quantity,
        price: selectedVariant.price,
        name: selectedVariant.id === 'base' ? product.name : `${product.name} - ${selectedVariant.name}`,
        image: displayImages[0],
      });
      addToast('Added to cart', 'success');
      setQuantity(1);
      setIsAddingToCart(false);
    }, 300);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12 md:py-20 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20">
            {/* Image Carousel */}
            <div className="relative group">
            <div className="aspect-4/5 relative bg-secondary rounded-none overflow-hidden">
                <Image
                  src={displayImages[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    {/* Inset Navigation Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {displayImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                            currentImageIndex === idx ? "bg-foreground w-4" : "bg-foreground/20"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <p className="text-xs  uppercase  text-muted-foreground mb-4">
                  {product.brand.name} / {product.category.name}
                </p>
                <h1 className="text-4xl md:text-5xl font-light text-foreground mb-4">
                  {product.name}
                </h1>
                <p className="text-3xl font-light text-foreground">
                  {formatPrice(selectedVariant.price)}
                </p>
              </div>

              {product.description && (
                <div className="text-base text-muted-foreground leading-relaxed max-w-prose border-l-2 border-border pl-6 italic">
                  {product.description}
                </div>
              )}

              {/* Variant Selector */}
              <VariantSelector
                variants={variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={(id) => {
                  setSelectedVariantId(id);
                  setCurrentImageIndex(0);
                }}
              />

              {/* Quantity Selection bounded by stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quantity</label>
                   {selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
                     <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 font-bold rounded-none">Only {selectedVariant.stock} left</span>
                   )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-none bg-secondary/5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-5 py-3 hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-bold font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      disabled={quantity >= selectedVariant.stock}
                      className="px-5 py-3 hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-border">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || selectedVariant.stock === 0}
                  className="w-full bg-primary text-primary-foreground py-7 text-sm  uppercase tracking-widest rounded-none hover:bg-primary/90 transition-all"
                >
                  {isAddingToCart
                    ? 'Processing...'
                    : selectedVariant.stock === 0
                      ? 'Out of Stock'
                      : 'Add to Cart'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => toggleItem({
                    variantId: selectedVariant.id === 'base' ? product.id : selectedVariant.id,
                    productId: product.id,
                    name: product.name,
                    image: displayImages[0],
                    price: selectedVariant.price,
                    slug: product.slug,
                  })}
                  className="w-full border border-border py-7 flex items-center gap-2 text-sm  uppercase tracking-widest rounded-none"
                >
                  <Heart size={18} className={cn(isInWishlist(selectedVariant.id === 'base' ? product.id : selectedVariant.id) && "fill-current text-red-500")} />
                  {isInWishlist(selectedVariant.id === 'base' ? product.id : selectedVariant.id) ? 'Saved' : 'Save to Wishlist'}
                </Button>
              </div>

              {/* Policies */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping</h4>
                  <p className="text-sm font-medium">Free on orders over ₦500,000</p>
                  <p className="text-xs text-muted-foreground">Domestic standard ₦15,000</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Returns</h4>
                  <p className="text-sm font-medium">30-Day Window</p>
                  <p className="text-xs text-muted-foreground">Hassle-free return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-20 border-t border-border">
             <ProductRecommendation products={recommendations} />
          </div>
        </div>
      </section>
    </>
  );
}
