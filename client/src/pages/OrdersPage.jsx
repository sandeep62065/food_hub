import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import { useGetMyOrdersQuery } from '../redux/api/orderApi';
import { formatCurrency, formatDate, getOrderStatusColor } from '../utils';
import { ORDER_STATUSES } from '../constants';

export default function OrdersPage() {
  const { data, isLoading } = useGetMyOrdersQuery({});
  const orders = data?.data || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-5 w-40 mb-3" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200 mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your order history will appear here</p>
            <Link to="/restaurants" className="btn-primary">Start Ordering</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const statusInfo = ORDER_STATUSES[order.orderStatus];
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/orders/${order._id}`} className="card block p-5 hover:shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading font-bold text-gray-900 dark:text-white">
                            {order.restaurant?.name}
                          </span>
                          <span className="text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`badge badge-${getOrderStatusColor(order.orderStatus) === 'green' ? 'success' : getOrderStatusColor(order.orderStatus) === 'red' ? 'danger' : getOrderStatusColor(order.orderStatus) === 'amber' ? 'warning' : 'info'}`}>
                          {statusInfo?.icon} {statusInfo?.label}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.grandTotal)}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
