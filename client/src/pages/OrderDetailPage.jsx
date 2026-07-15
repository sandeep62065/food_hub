import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Clock, X } from 'lucide-react';
import { useGetOrderQuery, useCancelOrderMutation } from '../redux/api/orderApi';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { formatCurrency, formatDate } from '../utils';
import { ORDER_STATUSES } from '../constants';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderQuery(id);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom max-w-4xl">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 space-y-3"><div className="skeleton h-5 w-32" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-2/3" /></div>
            <div className="card p-6 space-y-3"><div className="skeleton h-5 w-32" /><div className="skeleton h-40 w-full" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">📋</p>
          <h2 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200">Order not found</h2>
          <Link to="/orders" className="btn-primary mt-4">My Orders</Link>
        </div>
      </div>
    );
  }

  const order = data.data;
  const statusInfo = ORDER_STATUSES[order.orderStatus];
  const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);

  const handleCancel = async () => {
    try {
      await cancelOrder({ id: order._id, reason: cancelReason || 'Cancelled by customer' }).unwrap();
      setShowCancelModal(false);
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="btn-ghost w-9 h-9 p-0 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
          <span className="ml-auto badge badge-primary text-sm px-3 py-1">
            {statusInfo?.icon} {statusInfo?.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-4">
              From {order.restaurant?.name}
            </h2>
            <div className="space-y-4 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">× {item.quantity} @ {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 dark:border-dark-600 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span></div>
              <div className="flex justify-between text-gray-500"><span>GST</span><span>{formatCurrency(order.gst)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-dark-600">
                <span>Grand Total</span><span className="text-primary-500">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-600">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-500" /> Delivery To
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.deliveryAddress?.label && <span className="font-medium">{order.deliveryAddress.label}: </span>}
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city} {order.deliveryAddress?.pincode}
              </p>
            </div>

            {/* Payment */}
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>Payment: <strong className="text-gray-800 dark:text-gray-200">{order.paymentMethod}</strong></span>
              <span>Status: <strong className={order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}>{order.paymentStatus}</strong></span>
            </div>

            {/* Cancel Button */}
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="btn-danger text-sm py-2 w-full mt-4">
                <X className="w-4 h-4" /> Cancel Order
              </button>
            )}
          </div>

          {/* Status Timeline */}
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-6">Order Progress</h2>
            <OrderStatusTimeline status={order.orderStatus} statusHistory={order.statusHistory} />
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order" size="sm">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to cancel this order?</p>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            className="input h-24 resize-none mb-4"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowCancelModal(false)} className="btn-secondary flex-1">Keep Order</button>
            <button onClick={handleCancel} disabled={isCancelling} className="btn-danger flex-1">
              {isCancelling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Cancel Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
