import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { adminGetDashboardStats } from '@/lib/actions/admin';
import { formatPrice } from '@/lib/utils';

export default async function AdminDashboard() {
  const statsData = await adminGetDashboardStats();

  const stats = [
    {
      label: 'Products',
      value: statsData.productCount.toString(),
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Orders',
      value: statsData.orderCount.toString(),
      icon: ShoppingBag,
      href: '/admin/orders',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Total Revenue',
      value: formatPrice(statsData.totalRevenue),
      icon: DollarSign,
      href: '/admin/orders',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Growth',
      value: `+${statsData.growth}%`,
      icon: TrendingUp,
      href: '/admin/orders',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-light mb-2 text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-6 border border-border rounded-sm hover-lift group bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm text-muted-foreground font-medium">{stat.label}</h3>
                <div className={`p-2 rounded-sm ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-3xl font-light text-foreground group-hover:text-primary transition-colors">
                {stat.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light text-foreground">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="border border-border rounded-sm overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">Order</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {statsData.recentOrders.length > 0 ? (
                statsData.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-sm text-xs font-medium ${
                          order.status === 'PROCESSING'
                            ? 'bg-blue-50 text-blue-700'
                            : order.status === 'SHIPPED'
                              ? 'bg-purple-50 text-purple-700'
                              : order.status === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700'
                                : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground font-light">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-light mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Manage Products', href: '/admin/products', desc: 'Add, edit, or delete items' },
            { label: 'View Orders', href: '/admin/orders', desc: 'Manage customer purchases' },
            { label: 'Manage Categories', href: '/admin/categories', desc: 'Organize your collections' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="p-6 border border-border rounded-sm hover-lift group bg-card"
            >
              <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors text-foreground">
                {action.label}
              </h3>
              <p className="text-sm text-muted-foreground">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
