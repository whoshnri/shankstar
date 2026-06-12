'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-context';
import { useMutation } from '@/hooks/use-mutation';
import { adminUpdateOrderStatus } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/app/generated/prisma/client';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
}

interface OrderStatusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onStatusChange: (newStatus: OrderStatus) => void;
}

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Received', description: 'Selection registered, awaiting boutique preparation' },
  { value: 'PROCESSING', label: 'Preparation', description: 'Collection is being meticulously inspected and prepared' },
  { value: 'SHIPPED', label: 'Dispatch', description: 'Parcel has departed for global dispatch' },
  { value: 'DELIVERED', label: 'Arrived', description: 'Selection has arrived at its final destination' },
  { value: 'CANCELLED', label: 'Voided', description: 'Commission has been formally voided' },
];

export function OrderStatusSheet({
  isOpen,
  onClose,
  order,
  onStatusChange,
}: OrderStatusSheetProps) {
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);

  const mutation = useMutation(
    (status: OrderStatus) => adminUpdateOrderStatus(order.id, status),
    {
      onSuccess: (updatedOrder) => {
        onStatusChange(updatedOrder.status);
        addToast('Order status updated successfully', 'success');
        onClose();
      },
      onError: (err) => {
        addToast(err.message, 'error');
      }
    }
  );

  const handleStatusUpdate = () => {
    if (selectedStatus === order.status) {
      addToast('Please select a different status', 'info');
      return;
    }
    mutation.mutate(selectedStatus);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[500px] overflow-y-auto p-0 rounded-none border-l border-border shadow-none">
        <div className="flex flex-col h-full bg-background">
          <SheetHeader className="p-6 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle className="text-lg font-medium">Update Order Status</SheetTitle>
            <SheetDescription className="text-xs">
              Change the status for order {order.orderNumber}
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-8 flex-1 overflow-y-auto pb-24">
            {/* Order Info */}
            <div className="p-4 bg-secondary/50 rounded-none border border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Order Number</p>
                    <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                    <p className="text-sm font-mono text-foreground">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Customer</p>
                  <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">Current Status</p>
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-none text-[10px] uppercase tracking-widest font-bold">
                {order.status}
              </div>
            </div>

            {/* Status Options */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">Select New Status</p>
              <div className="grid gap-3">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value as OrderStatus)}
                    className={`
                      w-full p-4 rounded-none text-left transition-all border
                      ${
                        selectedStatus === status.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:bg-secondary'
                      }
                    `}
                  >
                    <p className="font-medium text-sm text-foreground uppercase tracking-wide">{status.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{status.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-border sticky bottom-0 bg-background flex gap-3 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 py-6 border-border text-xs uppercase tracking-widest rounded-none hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={mutation.isPending}
              className="flex-1 py-6 bg-primary text-primary-foreground text-xs uppercase tracking-widest rounded-none hover:shadow-lg transition-all"
            >
              {mutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
