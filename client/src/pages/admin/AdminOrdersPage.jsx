import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useGetAdminOrdersQuery } from '../../redux/api/otherApi';
import { useUpdateOrderStatusMutation } from '../../redux/api/orderApi';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUSES } from '../../constants';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useGetAdminOrdersQuery({ page, limit: 20, ...(status && { status }) });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const STATUS_OPTIONS = Object.entries(ORDER_STATUSES).map(([value, info]) => ({ value, label: `${info.icon} ${info.label}` }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Orders Management</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatus('')} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!status ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300'}`}>All</button>
        {Object.entries(ORDER_STATUSES).map(([val, info]) => (
          <button key={val} onClick={() => setStatus(val)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${status === val ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300'}`}>
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Restaurant</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="skeleton h-4 w-full" /></td></tr>)
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                  <td className="px-4 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{order.user?.name}</td>
                  <td className="px-4 py-4 text-gray-500">{order.restaurant?.name}</td>
                  <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.grandTotal)}</td>
                  <td className="px-4 py-4">
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-dark-600 rounded-lg px-2 py-1 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 cursor-pointer appearance-none pr-6"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-600 flex items-center justify-between text-sm">
            <p className="text-gray-500">{pagination.total} orders</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
              <span className="px-3 py-1.5 text-gray-600 dark:text-gray-300">Page {page}/{pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

