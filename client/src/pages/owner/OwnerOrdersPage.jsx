import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useGetRestaurantOrdersQuery, useUpdateOrderStatusMutation } from '../../redux/api/orderApi';
import { formatCurrency, formatDate } from '../../utils';
import { ORDER_STATUSES } from '../../constants';
import toast from 'react-hot-toast';

export default function OwnerOrdersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetRestaurantOrdersQuery({ page, limit: 20, ...(status && { status }) });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const OWNER_STATUSES = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      toast.success(`Order updated to "${ORDER_STATUSES[newStatus]?.label}"`);
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Incoming Orders</h1>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatus('')} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!status ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300'}`}>All</button>
        {Object.entries(ORDER_STATUSES).map(([val, info]) => (
          <button key={val} onClick={() => setStatus(val)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${status === val ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-300'}`}>
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card p-5 h-24 skeleton" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>No orders {status ? `with status "${ORDER_STATUSES[status]?.label}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="badge badge-primary text-xs">{ORDER_STATUSES[order.orderStatus]?.icon} {ORDER_STATUSES[order.orderStatus]?.label}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.user?.name} — {order.user?.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                  </div>
                  <p className="text-sm font-bold text-primary-500 mt-1">{formatCurrency(order.grandTotal)} — {order.paymentMethod}</p>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                </div>
                <div className="relative">
                  <select
                    value={order.orderStatus}
                    onChange={e => handleStatusUpdate(order._id, e.target.value)}
                    disabled={['delivered', 'cancelled'].includes(order.orderStatus)}
                    className="text-sm border border-gray-200 dark:border-dark-600 rounded-xl px-3 py-2 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-200 cursor-pointer appearance-none pr-8 disabled:opacity-50"
                  >
                    {OWNER_STATUSES.map(s => (
                      <option key={s} value={s}>{ORDER_STATUSES[s]?.icon} {ORDER_STATUSES[s]?.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

