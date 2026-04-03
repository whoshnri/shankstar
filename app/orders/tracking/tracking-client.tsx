'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Circle, Search, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

interface TrackingClientProps {
  initialOrder: any;
  categories: any[];
}

export default function TrackingClient({ initialOrder, categories }: TrackingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setError(null);
    startTransition(() => {
      router.push(`/orders/tracking?orderNumber=${searchInput.trim()}`);
    });
  };

  const order = initialOrder;

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'Order Received', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Package },
    PROCESSING: { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package },
    SHIPPED: { label: 'Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
    DELIVERED: { label: 'Delivered', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { id: 'PENDING', label: 'Order Placed', description: 'We have received your order' },
      { id: 'PROCESSING', label: 'Processing', description: 'Your order is being prepared' },
      { id: 'SHIPPED', label: 'Shipped', description: 'Your order is on the way' },
      { id: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered' },
    ];

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && status !== 'CANCELLED',
      current: index === currentIndex && status !== 'CANCELLED',
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header categories={categories} />

      <main className="flex-1 py-20 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">Track Your Order</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Live status updates for your luxury selection</p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-20">
            <div className="relative group">
              <input
                type="text"
                placeholder="ENTER ORDER NUMBER (E.G. ORD-1712...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                className="w-full pl-6 pr-32 py-5 bg-background border border-border rounded-none text-xs uppercase tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all duration-300 group-hover:border-muted-foreground/30"
              />
              <button
                type="submit"
                disabled={isPending}
                className="absolute right-2 top-2 bottom-2 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded-none hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {isPending ? 'SEARCHING...' : 'TRACK'}
              </button>
            </div>
          </form>

          {/* Results section */}
          {order ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-16">
              {/* Status Banner */}
              <div className={cn(
                "p-10 border rounded-none flex items-center justify-center gap-10 bg-secondary/5 text-center",
                STATUS_CONFIG[order.status]?.color || 'bg-secondary border-border'
              )}>
                <div className="p-6 bg-white/50 backdrop-blur-sm shadow-sm border border-white/20">
                  {(() => {
                    const Icon = STATUS_CONFIG[order.status]?.icon || Package;
                    return <Icon size={40} strokeWidth={0.5} />;
                  })()}
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-60 mb-2">Current Milestone</p>
                  <p className="text-3xl font-light tracking-tight">{STATUS_CONFIG[order.status]?.label || order.status}</p>
                </div>
              </div>

              {/* Timeline - Centered */}
              <div className="max-w-md mx-auto py-8">
                <div className="space-y-16">
                  {getTimelineSteps(order.status).map((step, index, arr) => (
                    <div key={step.id} className="relative flex gap-10">
                      {/* Line */}
                      {index < arr.length - 1 && (
                        <div className={cn(
                          "absolute left-4 top-10 bottom-[-40px] w-px",
                          arr[index + 1].completed ? "bg-primary" : "bg-border/50"
                        )} />
                      )}

                      {/* Node */}
                      <div className={cn(
                        "relative z-10 w-8 h-8 rounded-none border flex items-center justify-center transition-all duration-1000",
                        step.completed ? "bg-primary border-primary text-white scale-110" : "bg-background border-border text-muted-foreground/30"
                      )}>
                        {step.completed ? <CheckCircle size={14} strokeWidth={2.5} /> : <div className="w-1.5 h-1.5 bg-border rounded-full" />}
                      </div>

                      {/* Content */}
                      <div className="pt-1">
                        <p className={cn(
                          "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-700",
                          step.completed ? "text-foreground" : "text-muted-foreground/40"
                        )}>
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-3 font-light leading-relaxed max-w-xs">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details Grid - Symmetrical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border py-12">
                <div className="bg-background p-10 space-y-8">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground border-b border-border pb-4">Logistics</h3>
                  <dl className="space-y-6 text-[10px] uppercase tracking-widest">
                    <div className="flex justify-between">
                      <dt className="opacity-50">Reference</dt>
                      <dd className="font-bold text-foreground">{order.orderNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="opacity-50">Authorized On</dt>
                      <dd className="font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-6">
                      <dt className="opacity-50">Final Total</dt>
                      <dd className="text-sm font-mono font-bold text-primary">{formatPrice(order.total)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-background p-10 space-y-8">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground border-b border-border pb-4">Destination</h3>
                  <div className="text-[10px] space-y-3 uppercase tracking-widest leading-relaxed">
                    <p className="font-bold text-lg tracking-normal capitalize">{order.customer.firstName} {order.customer.lastName}</p>
                    <p className="opacity-70">{order.customer.address}</p>
                    <p className="opacity-70">{order.customer.city}, {order.customer.state} {order.customer.zip}</p>
                    <p className="mt-6 lowercase tracking-normal opacity-40 font-light">{order.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-6 py-12 border-t border-border">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground border-b border-border pb-2">Parcel Contents</h3>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-4 bg-secondary/20 border border-border/50">
                      <div>
                        <p className="font-bold uppercase tracking-widest">{item.variant.product.name}</p>
                        <p className="text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">{item.variant.name} &times; {item.quantity}</p>
                      </div>
                      <p className="font-mono text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help & Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-12">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full py-8 border-border text-[10px] uppercase tracking-[0.2em] transition-all">
                    Return Home
                  </Button>
                </Link>
                <div className="flex-1 p-6 bg-secondary/30 border border-border text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-bold">Issues with delivery?</p>
                  <Link href="/contact" className="text-xs uppercase tracking-widest font-bold text-primary hover:text-foreground transition-colors underline underline-offset-8 decoration-primary/30">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          ) : initialOrder === null && (
            <div className="animate-in fade-in duration-700 text-center py-20 px-8 border border-dashed border-border group hover:border-muted-foreground/30 transition-all">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-6 group-hover:text-primary/50 transition-all" />
              <p className="text-lg uppercase font-bold">Please enter a valid order number to begin tracking</p>
              <p className="text-base text-muted-foreground/60 mt-4 max-w-xs mx-auto">Tracking details are available as soon as your selection is prepared for dispatch.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
