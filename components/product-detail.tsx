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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

function ProductImageCarousel({
  productName,
  displayImages,
  currentImageIndex,
  onPrev,
  onNext,
  onSelect,
  priority = false,
  className,
  showControls = false,
}: {
  productName: string;
  displayImages: string[];
  currentImageIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  priority?: boolean;
  className?: string;
  showControls?: boolean;
}) {
  return (
    <div className={cn("relative group w-full", className)}>
      <div className="aspect-square mt-20 md:mt-0 relative bg-secondary overflow-hidden w-full">
        <Image
          src={displayImages[currentImageIndex]}
          alt={productName}
          fill
          className="object-cover object-center transition-opacity duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />

        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border transition-opacity",
                showControls
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm border border-border transition-opacity",
                showControls
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {displayImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "h-1.5 rounded-none transition-all duration-300",
                    currentImageIndex === idx
                      ? "bg-white w-4"
                      : "bg-white/30 w-1.5",
                  )}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductDetailsPanel({
  product,
  quantity,
  setQuantity,
  isAddingToCart,
  isCheckingOut,
  onAddToCart,
  recommendations,
  onRecommendationClick,
  showRecommendations = true,
}: {
  product: DBProduct;
  quantity: number;
  setQuantity: (value: number | ((prev: number) => number)) => void;
  isAddingToCart: boolean;
  isCheckingOut: boolean;
  onAddToCart: (redirect?: boolean) => void;
  recommendations: RecommendedProduct[];
  onRecommendationClick?: () => void;
  showRecommendations?: boolean;
}) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-light text-foreground mb-3">
            {product.name}
          </h1>
          {product.description && (
            <div className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-prose">
              {product.description}
            </div>
          )}
        </div>
      </div>

      <p className="text-xl md:text-2xl font-light text-foreground">
        {formatPrice(product.basePrice)}
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Quantity
          </label>
          {product.stock < 10 && product.stock > 0 && (
            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 font-bold">
              Only {product.stock} left
            </span>
          )}
        </div>
        <div className="flex items-center border border-border bg-secondary/5 w-fit">
          <button
            type="button"
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
            type="button"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
            className="px-5 py-3 hover:bg-secondary transition-colors disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
        <Button
          onClick={() => onAddToCart(false)}
          disabled={isAddingToCart || isCheckingOut || product.stock === 0}
          variant="outline"
          className="w-full py-6 text-sm uppercase tracking-widest rounded-none hover:bg-secondary hover:text-black transition-all"
        >
          {isAddingToCart
            ? "Adding..."
            : product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
        </Button>

        <Button
          onClick={() => onAddToCart(true)}
          disabled={isAddingToCart || isCheckingOut || product.stock === 0}
          className="w-full bg-primary text-primary-foreground py-6 text-sm uppercase tracking-widest rounded-none hover:bg-primary/90 transition-all"
        >
          {isCheckingOut ? "Redirecting..." : "Buy Now"}
        </Button>
      </div>

      {showRecommendations && recommendations.length > 0 && (
        <ProductRecommendation
          products={recommendations}
          onItemClick={onRecommendationClick}
          className="pt-4"
        />
      )}
    </div>
  );
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const imageCarouselProps = {
    productName: product.name,
    displayImages,
    currentImageIndex,
    onPrev: prevImage,
    onNext: nextImage,
    onSelect: setCurrentImageIndex,
    priority: true,
  };

  return (
    <div className="h-full relative">
      <div className="border-b border-border px-4 md:px-6 py-3 sticky top-[var(--mobile-header-height)] md:top-0 bg-background/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            {prevSlug && (
              <Link
                href={`/${prevSlug}`}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </Link>
            )}

            {nextSlug && (
              <Link
                href={`/${nextSlug}`}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: image-first */}
      <div className="md:hidden relative w-full pb-20">
        <ProductImageCarousel {...imageCarouselProps} showControls />

        <button
          type="button"
          onClick={() => setIsDetailsOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-8 py-3 bg-background/95 backdrop-blur-sm border border-border text-xs uppercase tracking-widest shadow-sm"
        >
          View Details
        </button>
      </div>

      {/* Desktop */}
      <section className="hidden md:block py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8 mb-12">
            <ProductImageCarousel {...imageCarouselProps} />
            <ProductDetailsPanel
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isAddingToCart={isAddingToCart}
              isCheckingOut={isCheckingOut}
              onAddToCart={handleAddToCart}
              recommendations={recommendations}
              showRecommendations={false}
            />
          </div>

          <ProductRecommendation products={recommendations} />
        </div>
      </section>

      <Drawer open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DrawerContent className="max-h-[78vh] px-4">
          <DrawerHeader className="border-b border-border py-4">
            <DrawerTitle className="text-left text-sm flex items-center justify-between uppercase tracking-widest font-medium">
              Details
              <ShareModal slug={product.slug} />
            </DrawerTitle>
          </DrawerHeader>
          <div
            className="overflow-y-auto pb-8"
            style={{
              scrollbarWidth: "none",
            }}
          >
            <ProductDetailsPanel
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isAddingToCart={isAddingToCart}
              isCheckingOut={isCheckingOut}
              onAddToCart={handleAddToCart}
              recommendations={recommendations}
              onRecommendationClick={() => setIsDetailsOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
