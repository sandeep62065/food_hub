import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { closeDrawer, selectCart } from '../redux/slices/cartSlice';
import { useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '../redux/api/foodApi';
import { formatCurrency, calculateCartTotals } from '../utils';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, restaurant, isDrawerOpen, subtotal } = useSelector(selectCart);
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  const totals = items.length > 0 ? calculateCartTotals(items, restaurant?.deliveryFee || 30) : null;

  useEffect(() => {
    if (isDrawerOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  const handleQuantityChange = async (itemId, newQty) => {
    try {
      await updateItem({ itemId, quantity: newQty }).unwrap();
    } catch {
      toast.error('Failed to update cart');
    }
  };

  const handleRemove = async (itemId, name) => {
    try {
      await removeItem(itemId).unwrap();
      toast.success(`${name} removed`);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    dispatch(closeDrawer());
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeDrawer())}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-white dark:bg-dark-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">Your Cart</h2>
                {items.length > 0 && (
                  <span className="badge badge-primary">{items.length} items</span>
                )}
              </div>
              <button onClick={() => dispatch(closeDrawer())} className="btn-ghost w-8 h-8 p-0 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Restaurant info */}
            {restaurant && (
              <div className="px-5 py-3 bg-primary-50 dark:bg-primary-500/10 border-b border-primary-100 dark:border-primary-500/20">
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  Ordering from: <span className="font-bold">{restaurant.name}</span>
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-gray-700 dark:text-gray-200">Your cart is empty</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add items from a restaurant to get started</p>
                  </div>
                  <button onClick={() => { dispatch(closeDrawer()); navigate('/restaurants'); }} className="btn-primary text-sm">
                    Browse Restaurants
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3"
                    >
                      <img
                        src={item.food?.images?.[0] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100'}
                        alt={item.food?.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1">
                          {item.food?.name}
                        </p>
                        <p className="text-primary-500 font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => item.quantity > 1 ? handleQuantityChange(item._id, item.quantity - 1) : handleRemove(item._id, item.food?.name)}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-600 hover:bg-primary-100 dark:hover:bg-primary-500/20 flex items-center justify-center transition-colors"
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="ml-auto text-sm font-medium text-gray-600 dark:text-gray-300">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary & Checkout */}
            {items.length > 0 && totals && (
              <div className="border-t border-gray-100 dark:border-dark-600 p-5 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>{totals.deliveryFee === 0 ? <span className="text-green-500">Free</span> : formatCurrency(totals.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (5%)</span>
                    <span>{formatCurrency(totals.gst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-200 dark:border-dark-600">
                    <span>Total</span>
                    <span className="text-primary-500">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn-primary w-full">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => clearCart()} className="btn-ghost w-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
