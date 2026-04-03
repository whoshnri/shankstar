'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { OrderStatusSheet } from '@/components/admin/order-status-sheet';
import { adminGetOrders, adminUpdateOrderStatus } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/utils';
import { OrderStatus } from '@/app/generated/prisma/client';

type OrderRow = Awaited<ReturnType<typeof adminGetOrders>>[number];

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [isStatusSheetOpen, setIsStatusSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadOrders = async () => {
    try {
      const data = await adminGetOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(orderId, newStatus as any);
        await loadOrders();
      } catch (err) {
        console.error('Failed to update order status', err);
      }
      setIsStatusSheetOpen(false);
    });
  };

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.status === filterStatus)
    : orders;

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light mb-1">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer orders ({filteredOrders.length} total, {formatPrice(totalRevenue)} revenue)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus(null)}
          className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            filterStatus === null
              ? 'bg-primary text-primary-foreground'
              : 'border border-border hover:bg-secondary'
          }`}
        >
          All Orders
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'border border-border hover:bg-secondary'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{order._count.items}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-sm text-xs font-medium ${
                        STATUS_COLORS[order.status] ?? ''
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsStatusSheetOpen(true);
                      }}
                      disabled={isPending}
                      className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm hover:bg-secondary transition-colors text-sm font-medium w-full justify-center md:w-auto"
                    >
                      Update <ChevronDown size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Sheet */}
      {selectedOrder && (
        <OrderStatusSheet
          isOpen={isStatusSheetOpen}
          onClose={() => {
            setIsStatusSheetOpen(false);
            setSelectedOrder(null);
          }}
          order={{
            id: selectedOrder.id,
            orderNumber: selectedOrder.orderNumber,
            customerName: `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`,
            total: selectedOrder.total,
            status: selectedOrder.status,
          }}
          onStatusChange={(newStatus) => handleUpdateStatus(selectedOrder.id, newStatus)}
        />
      )}
    </div>
  );
}
