import { motion } from 'framer-motion';
import { ShoppingBag, Star, TrendingUp, UtensilsCrossed, PlusCircle, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetMyRestaurantQuery } from '../../redux/api/restaurantApi';
import { useGetRestaurantOrdersQuery } from '../../redux/api/orderApi';
import { useGetFoodsByRestaurantQuery } from '../../redux/api/foodApi';
import { formatCurrency } from '../../utils';
import { ORDER_STATUSES } from '../../constants';

export default function OwnerDashboardPage() {
  const { data: restaurantData, isLoading: restLoading } = useGetMyRestaurantQuery();
  const restaurant = restaurantData?.data;

  const { data: ordersData } = useGetRestaurantOrdersQuery({ limit: 5 }, { skip: !restaurant });
  const { data: foodsData } = useGetFoodsByRestaurantQuery(restaurant?._id, { skip: !restaurant });

  const orders = ordersData?.data || [];
  const foods = foodsData?.data || [];

  const pendingOrders = orders.filter(o => ['placed', 'confirmed'].includes(o.orderStatus)).length;
  const todayRevenue = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today && o.orderStatus === 'delivered';
  }).reduce((sum, o) => sum + o.grandTotal, 0);

  if (restLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="font-heading font-bold text-2xl text-gray-700 dark:text-gray-200 mb-2">No Restaurant Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Register your restaurant to start accepting orders</p>
        <Link to="/owner/create-restaurant" className="btn-primary"><PlusCircle className="w-4 h-4" />Register Restaurant</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      <div className="card p-6 flex items-center gap-4">
        <img src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'} alt={restaurant.name} className="w-16 h-16 rounded-2xl object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">{restaurant.name}</h1>
            {!restaurant.isApproved && <span className="badge badge-warning">Pending Approval</span>}
            {restaurant.isApproved && <span className="badge badge-success">Active</span>}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{restaurant.address?.city} • {restaurant.cuisine?.join(', ')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/foods/add" className="btn-primary text-sm"><PlusCircle className="w-4 h-4" />Add Food</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: 'Pending Orders', value: pendingOrders, color: 'bg-amber-500' },
          { icon: UtensilsCrossed, label: 'Food Items', value: foods.length, color: 'bg-blue-500' },
          { icon: Star, label: 'Avg Rating', value: restaurant.avgRating?.toFixed(1) || '—', color: 'bg-yellow-500' },
          { icon: TrendingUp, label: "Today's Revenue", value: formatCurrency(todayRevenue), color: 'bg-green-500' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="card p-5 flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="font-heading font-bold text-xl text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/owner/orders" className="text-sm text-primary-500 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-6">No orders yet. Share your menu!</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-600 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()} — {order.user?.name}</p>
                  <p className="text-xs text-gray-400">{order.items.map(i => i.name).join(', ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{formatCurrency(order.grandTotal)}</span>
                  <span className="badge badge-primary text-xs">{ORDER_STATUSES[order.orderStatus]?.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

