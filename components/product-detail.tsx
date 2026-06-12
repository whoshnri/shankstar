"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ProductRecommendation,
  RecommendedProduct,
} from "@/components/product-recommendation";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import ShareModal from "./share-modal";

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  stock: number;
  images: string[];
  category: { name: string };
}

interface ProductDetailProps {
  product: DBProduct;
  recommendations: RecommendedProduct[];
  prevSlug?: string | null;
  nextSlug?: string | null;
}

export function ProductDetail({
  product,
  recommendations,
  prevSlug,
  nextSlug,
}: ProductDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { addItem } = useCart();
  const { addToast } = useToast();

  const displayImages =
    product.images.length > 0 ? product.images : ["/placeholder.jpg"];

  const handleAddToCart = async (redirect = false) => {
    if (redirect) setIsCheckingOut(true);
    else setIsAddingToCart(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem({
      productId: product.id,
      quantity,
      price: product.basePrice,
      name: product.name,
      image: displayImages[0],
    });

    if (redirect) {
      router.push("/checkout");
    } else {
      addToast("Added to cart", "success");
      setQuantity(1);
      setIsAddingToCart(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length,
    );
  };

  return (
    <div className="h-full relative">
      <div className="border-b border-border px-4 md:px-6 py-4 sticky top-[var(--mobile-header-height)] md:top-0 bg-background/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Products
          </Link>

          <div className="flex items-center gap-6">
            {prevSlug && (
              <Link
                href={`/${prevSlug}`}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                Previous
              </Link>
            )}

            {nextSlug && (
              <Link
                href={`/${nextSlug}`}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="py-12 md:py-20 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-20">
            <div className="relative group">
              <div className="aspect-square relative bg-secondary rounded-none overflow-hidden">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={20} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {displayImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "w-1.5 h-1.5 rounded-none transition-all duration-300",
                            currentImageIndex === idx
                              ? "bg-white w-4"
                              : "bg-white/20",
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {product.category.name}
                  </p>
                  <h1 className="text-4xl font-light text-foreground mb-4">
                    {product.name}
                  </h1>
                  {product.description && (
                    <div className="text-base text-muted-foreground leading-relaxed max-w-prose pl-3">
                      {product.description}
                    </div>
                  )}
                </div>
                <ShareModal slug={product.slug} />
              </div>

              <p className="text-2xl font-light text-foreground">
                {formatPrice(product.basePrice)}
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Quantity
                  </label>
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 font-bold rounded-none">
                      Only {product.stock} left
                    </span>
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
                    <span className="w-12 text-center text-sm font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                      className="px-5 py-3 hover:bg-secondary transition-colors disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <Button
                  onClick={() => handleAddToCart(false)}
                  disabled={
                    isAddingToCart || isCheckingOut || product.stock === 0
                  }
                  variant="outline"
                  className="w-full py-7 text-sm uppercase tracking-widest rounded-none hover:bg-secondary hover:text-black transition-all"
                >
                  {isAddingToCart
                    ? "Adding..."
                    : product.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                </Button>

                <Button
                  onClick={() => handleAddToCart(true)}
                  disabled={
                    isAddingToCart || isCheckingOut || product.stock === 0
                  }
                  className="w-full bg-primary text-primary-foreground py-7 text-sm uppercase tracking-widest rounded-none hover:bg-primary/90 transition-all"
                >
                  {isCheckingOut ? "Redirecting..." : "Buy Now"}
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-20 border-t border-border">
            <ProductRecommendation products={recommendations} />
          </div>
        </div>
      </section>
    </div>
  );
}
