'use client';

import { useState, useTransition, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { ChevronLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { upsertCustomer } from '@/lib/actions/customers';
import { createOrder } from '@/lib/actions/orders';
import { InsufficientStockError, TAX_RATE, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING } from '@/lib/actions/orders.schema';
import { formatPrice, cn } from '@/lib/utils';

const checkoutSchema = z.object({
  // Step 1: Shipping
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  // Step 2: Payment
  cardName: z.string().min(1, 'Cardholder name is required'),
  cardNumber: z.string().min(16, 'Card number must be at least 16 digits'),
  expiryDate: z.string().regex(/^\d{2}\s\/\s\d{2}$/, 'Format: MM / YY'),
  cvv: z.string().min(3, 'CVV must be at least 3 digits'),
  // Step 3: Coupon
  couponCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Persistence Utilities
const ENCRYPTION_KEY = 'SHANK_';
const encodeState = (data: Partial<CheckoutFormData>, step: number, customerId: string | null) => {
  // Exclude sensitive payment info
  const { cardName, cardNumber, expiryDate, cvv, ...safeData } = data;
  const raw = JSON.stringify({ ...safeData, step, customerId });
  return btoa(raw.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))).join(''));
};

const decodeState = (encoded: string) => {
  try {
    const raw = atob(encoded).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))).join('');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, cartTotal, clearCart } = useCart();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const detectCardType = (number: string) => {
    if (number.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (number.startsWith('6')) return 'Discover';
    return null;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const formData = watch();

  // Hydrate state from URL on mount
  useEffect(() => {
    const stateParam = searchParams.get('state');
    if (stateParam) {
      const decoded = decodeState(stateParam);
      if (decoded) {
        Object.entries(decoded).forEach(([key, value]) => {
          if (key !== 'step' && key !== 'customerId') {
            setValue(key as any, value);
          }
        });
        if (decoded.step) setStep(decoded.step);
        if (decoded.customerId) setCustomerId(decoded.customerId);
      }
    }
  }, [searchParams, setValue]);

  // Sync state to URL on change
  useEffect(() => {
    const encoded = encodeState(formData, step, customerId);
    const newUrl = `${window.location.pathname}?state=${encoded}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [formData, step, customerId]);

  const onFinalSubmit = (data: CheckoutFormData) => {
    if (step === 3) {
      // Step 3: Place Order with Simulated Payment
      startTransition(async () => {
        try {
          if (!customerId) {
            // Fallback: try to upsert customer if missing (e.g. refresh at step 3)
            const customer = await upsertCustomer({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              zip: data.zip,
            });
            setCustomerId(customer.id);
          }

          setPaymentStatus('Verifying card details...');
          await new Promise(r => setTimeout(r, 1500));
          setPaymentStatus('Authorizing funds...');
          await new Promise(r => setTimeout(r, 1500));
          setPaymentStatus('Finalizing transaction...');
          await new Promise(r => setTimeout(r, 1000));

          const cartItems = items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          }));
          
          const order = await createOrder({
            customerId: customerId || (await upsertCustomer(data)).id, // Double-check safety
            items: cartItems,
            couponCode: data.couponCode,
          });
          
          clearCart();
          router.push(`/orders/confirmation?order=${order.orderNumber}`);
        } catch (err: any) {
          setPaymentStatus(null);
          if (err instanceof InsufficientStockError) {
            addToast('Item no longer available in requested quantity', 'error');
          } else if (err.code === 'P2028' || err.message?.includes('P2028')) {
            addToast('The system is currently busy. Please try again in a moment.', 'error');
          } else {
            addToast(err instanceof Error ? err.message : 'Failed to place order', 'error');
          }
        }
      });
    }
  };

  const shippingCost = cartTotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = cartTotal * TAX_RATE;
  const orderTotal = cartTotal + shippingCost + tax;

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header categories={[]} />
        <div className="flex-1 flex items-center justify-center">
           <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header categories={[]} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4 tracking-tight leading-tight">Your cart is empty</h1>
            <Link
              href="/"
              className="inline-block px-10 py-5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-none hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header categories={[]} />

      <div className="flex-1 py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft size={16} />
            Back to Shopping
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
            {/* Form */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-light mb-12 tracking-tight">Checkout</h1>

              {/* Step Indicator */}
              <div className="flex gap-4 mb-12">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                        step >= stepNum ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      0{stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={cn("h-px w-12 transition-all duration-500", step > stepNum ? "bg-foreground" : "bg-border")} />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-10">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-xl font-bold uppercase tracking-widest border-b border-border pb-4">Shipping Address</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField label="First Name" placeholder="Henry" {...register('firstName')} error={errors.firstName} className="rounded-none border-border" />
                      <FormField label="Last Name" placeholder="Smith" {...register('lastName')} error={errors.lastName} className="rounded-none border-border" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField label="Email" type="email" placeholder="henry@example.com" {...register('email')} error={errors.email} className="rounded-none border-border" />
                      <FormField label="Phone" type="tel" placeholder="+234 800 000 0000" {...register('phone')} error={errors.phone} className="rounded-none border-border" />
                    </div>

                    <FormField label="Address" placeholder="123 Luxury St" {...register('address')} error={errors.address} className="rounded-none border-border" />

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                      <FormField label="City" placeholder="Lagos" {...register('city')} error={errors.city} className="rounded-none border-border" />
                      <FormField label="State" placeholder="Lagos" {...register('state')} error={errors.state} className="rounded-none border-border" />
                      <div className="col-span-2 lg:col-span-1">
                        <FormField label="ZIP Code" placeholder="100001" {...register('zip')} error={errors.zip} className="rounded-none border-border" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-xl  uppercase tracking-widest border-b border-border pb-4">Payment Information</h2>

                    <FormField label="Cardholder Name" placeholder="HENRY SMITH" {...register('cardName')} error={errors.cardName} className="rounded-none border-border uppercase tracking-widest " />

                    <div className="relative">
                      <FormField
                        label="Card Number"
                        placeholder="0000 0000 0000 0000"
                        {...register('cardNumber')}
                        className="pr-12 font-mono rounded-none border-border"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setCardType(detectCardType(raw));
                          const value = raw.slice(0, 16);
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          e.target.value = formatted;
                          register('cardNumber').onChange(e);
                        }}
                      />
                      <div className="absolute right-4 top-[38px] text-muted-foreground flex items-center">
                        {cardType ? (
                          <span className="text-[10px]  uppercase tracking-widest bg-secondary px-2 py-1">{cardType}</span>
                        ) : (
                          <CreditCard size={20} />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <FormField
                        label="Expiry Date"
                        placeholder="MM / YY"
                        {...register('expiryDate')}
                        className="font-mono rounded-none border-border text-center"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          let formatted = value;
                          if (value.length > 2) {
                            formatted = `${value.slice(0, 2)} / ${value.slice(2)}`;
                          }
                          e.target.value = formatted;
                          register('expiryDate').onChange(e);
                        }}
                      />
                      <FormField
                        label="CVV"
                        type="password"
                        placeholder="000"
                        maxLength={3}
                        {...register('cvv')}
                        className="font-mono rounded-none border-border text-center"
                        error={errors.cvv}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-xl font-bold uppercase tracking-widest border-b border-border pb-4">Review Your Order</h2>
                    <FormField label="Coupon Code" placeholder="OFFKLUXURY" {...register('couponCode')} error={errors.couponCode} className="rounded-none border-border" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-10 border-t border-border">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 py-7 border-border text-xs hover:text-black  uppercase tracking-widest rounded-none hover:bg-secondary"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={async () => {
                      if (step === 1) {
                        const fields: (keyof CheckoutFormData)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
                        const isValid = await trigger(fields);
                        if (isValid) {
                          startTransition(async () => {
                            try {
                              const customer = await upsertCustomer({
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                email: formData.email,
                                phone: formData.phone,
                                address: formData.address,
                                city: formData.city,
                                state: formData.state,
                                zip: formData.zip,
                              });
                              setCustomerId(customer.id);
                              setStep(2);
                            } catch (err) {
                              addToast(err instanceof Error ? err.message : 'Failed to save customer', 'error');
                            }
                          });
                        }
                      } else if (step === 2) {
                        const fields: (keyof CheckoutFormData)[] = ['cardName', 'cardNumber', 'expiryDate', 'cvv'];
                        const isValid = await trigger(fields);
                        if (isValid) setStep(3);
                      } else {
                        handleSubmit(onFinalSubmit)();
                      }
                    }}
                    disabled={isPending}
                    className="flex-1 py-7 bg-primary text-primary-foreground text-xs  uppercase tracking-widest rounded-none hover:shadow-xl transition-all"
                  >
                    {isPending 
                      ? (paymentStatus || 'Processing...')
                      : step === 3
                        ? 'Place Order'
                        : 'Continue To ' + (step === 1 ? 'Payment' : 'Review')}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-none p-8 sticky top-28 bg-secondary/5">
                <h2 className="text-xl  uppercase tracking-widest mb-8 border-b border-border pb-4">Summary</h2>

                <div className="space-y-6 mb-8 pb-8 border-b border-border max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-6 group">
                      <div className="relative w-20 h-24 bg-secondary rounded-none overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-sm  uppercase tracking-widest text-foreground truncate mb-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4 font-mono uppercase tracking-widest">Qty: {item.quantity}</p>
                        <p className="text-sm  font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 text-xs  uppercase tracking-widest">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-mono">
                      {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-mono">{formatPrice(tax)}</span>
                  </div>
                  <div className="pt-4 flex justify-between text-base ">
                    <span>Total</span>
                    <span className="font-mono text-xl">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                <div className="mt-10 p-4 border border-dashed border-border bg-background">
                   <p className="text-[10px] text-muted-foreground leading-relaxed text-center  tracking-widest">
                     PAYMENTS ARE SECURED AND ENCRYPTED WITH INDUSTRIAL STANDARDS.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

