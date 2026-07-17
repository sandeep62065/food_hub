import { useState } from 'react';
import { useGetAvailableOrdersQuery, useGetMyDeliveriesQuery, useAcceptOrderMutation } from '../../redux/api/deliveryApi';
import { formatCurrency, formatShortDate } from '../../utils';
import { Package, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DeliveryDashboardPage() {
  const { data: availableData, isLoading: availableLoading } = useGetAvailableOrdersQuery(undefined, { pollingInterval: 10000 });
  const { data: myOrdersData, isLoading: myOrdersLoading } = useGetMyDeliveriesQuery();
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const navigate = useNavigate();

  const availableOrders = availableData?.data || [];
  const myOrders = myOrdersData?.data || [];
  
  const activeOrders = myOrders.filter(o => o.orderStatus === 'out_for_delivery' || o.orderStatus === 'preparing');

  const handleAccept = async (id) => {
    try {
      await acceptOrder(id).unwrap();
      toast.success('Order accepted successfully!');
      navigate(`/delivery/order/${id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to accept order');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">Delivery Dashboard</h1>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-xl text-primary-500 flex items-center gap-2">
            <Navigation className="w-5 h-5" /> Current Deliveries
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeOrders.map(order => (
              <div key={order._id} className="card p-5 border-l-4 border-l-primary-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-1">{order.restaurant?.name}</h3>
                  </div>
                  <span className="badge badge-primary">{order.orderStatus.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="line-clamp-2">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                </div>
                <Link to={`/delivery/order/${order._id}`} className="btn-primary w-full text-center block">
                  Go to Delivery Map
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Orders Section */}
      <div className="space-y-4">
        <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5" /> Available Orders
        </h2>
        
        {availableLoading ? (
           <div className="flex justify-center p-8"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : availableOrders.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
            No orders available for pickup right now.
          </div>
        ) : (
          <div className="grid gap-4">
            {availableOrders.map(order => (
              <div key={order._id} className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatShortDate(order.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {order.restaurant?.name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Deliver to:</p>
                      <p>{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-3 md:min-w-[150px]">
                  <p className="font-bold text-xl text-primary-600 dark:text-primary-400">
                    {formatCurrency(order.grandTotal)}
                  </p>
                  <button 
                    onClick={() => handleAccept(order._id)}
                    disabled={isAccepting}
                    className="btn-primary w-full flex justify-center items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
