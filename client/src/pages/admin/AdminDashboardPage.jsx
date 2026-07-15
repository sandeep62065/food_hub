import { motion } from 'framer-motion';
import { Users, Store, ShoppingBag, UtensilsCrossed, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useGetAdminStatsQuery } from '../../redux/api/otherApi';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUSES } from '../../constants';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, link }) {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={link || '#'} className="card p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow cursor-pointer">
        <div className={`w-12 h-12 ${colorMap[color] || 'bg-primary-500'} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-heading font-bold text-2xl text-gray-900 dark:text-white">{value}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminStatsQuery();
  const stats = data?.data?.stats || {};
  const recentOrders = data?.data?.recentOrders || [];

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card p-6 h-24 skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Customers" value={stats.totalUsers || 0} color="blue" link="/admin/users" />
        <StatCard icon={Store} label="Restaurants" value={stats.totalRestaurants || 0} color="green" link="/admin/restaurants" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders || 0} color="orange" link="/admin/orders" />
        <StatCard icon={UtensilsCrossed} label="Food Items" value={stats.totalFoods || 0} color="purple" link="/admin/foods" />
        <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(stats.totalRevenue || 0)} color="green" />
        <StatCard icon={AlertCircle} label="Pending Approvals" value={stats.pendingRestaurants || 0} color="red" link="/admin/restaurants" />
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-500 hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-dark-600">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Restaurant</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                    <td className="py-3 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-200">{order.user?.name}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{order.restaurant?.name}</td>
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.grandTotal)}</td>
                    <td className="py-3">
                      <span className="badge badge-primary text-xs">{ORDER_STATUSES[order.orderStatus]?.label}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

