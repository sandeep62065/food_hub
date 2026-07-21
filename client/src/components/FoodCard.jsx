import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Star, Leaf, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openDrawer, selectCart } from '../redux/slices/cartSlice';
import { selectIsAuthenticated, selectAuth } from '../redux/slices/authSlice';
import { useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation, useClearCartMutation } from '../redux/api/foodApi';
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '../redux/api/wishlistApi';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function FoodCard({ food, index = 0 }) {
  const { _id, name, description, images, price, discountPrice, isVeg, avgRating, isAvailable } = food;
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { user } = useSelector(selectAuth);
  const isCustomer = isAuthenticated && user?.role === 'customer';
  
  const { items } = useSelector(selectCart);
  const cartItem = items?.find(i => (i.food?._id || i.food) === _id);

  const [addToCart] = useAddToCartMutation();
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();
  
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isCustomer });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isProcessing = isAdding || isUpdating || isRemoving;

  const isWishlisted = wishlistData?.data?.foods?.some((f) => (f._id || f) === _id) ?? false;

  const effectivePrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAvailable) return;

    setIsAdding(true);
    try {
      const result = await addToCart({ foodId: _id, quantity: 1 }).unwrap();
      toast.success(`${name} added to cart!`);
    } catch (err) {
      if (err.data?.conflict) {
        toast((t) => (
          <div>
            <p className="font-medium text-sm text-gray-900">{err.data.message}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="btn-primary text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 border-none shadow-sm"
                onClick={async () => {
                  toast.dismiss(t.id);
                  setIsAdding(true);
                  try {
                    await clearCart().unwrap();
                    await addToCart({ foodId: _id, quantity: 1 }).unwrap();
                    toast.success(`${name} added to cart!`);
                  } catch (e) {
                    toast.error('Failed to add to cart');
                  } finally {
                    setIsAdding(false);
                  }
                }}
              >
                Clear Cart & Add
              </button>
              <button
                className="btn-secondary text-xs px-3 py-1.5"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        ), { duration: 10000 });
      } else {
        toast.error(err.data?.message || 'Failed to add to cart');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = async (e, newQuantity) => {
    e.preventDefault();
    if (!cartItem) return;
    try {
      if (newQuantity === 0) {
        await removeCartItem(cartItem._id).unwrap();
        toast.success(`${name} removed from cart`);
      } else {
        await updateCartItem({ itemId: cartItem._id, quantity: newQuantity }).unwrap();
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update quantity');
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(_id).unwrap();
        toast.success(`${name} removed from wishlist`);
      } else {
        await addToWishlist({ foodId: _id }).unwrap();
        toast.success(`${name} added to wishlist!`);
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/food/${_id}`} className="glass-card flex flex-col h-full overflow-hidden group">
        {/* Image */}
        <div className="relative overflow-hidden h-44">
          <img
            src={images?.[0] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Veg / Non-Veg Badge */}
          <div className="absolute top-2 left-2">
            <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${isVeg ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          {/* Wishlist Heart Button */}
          {isCustomer && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200 z-10"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors duration-200 ${
                  isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
                }`}
              />
            </motion.button>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-10 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {discountPercent}% OFF
            </div>
          )}


          {/* Unavailable Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Currently Unavailable</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-heading font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
            {name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{avgRating.toFixed(1)}</span>
            </div>
          )}

          {/* Price + Add Button */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-dark-600">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(effectivePrice)}</span>
              {hasDiscount && (
                <span className="ml-1.5 text-sm text-gray-400 line-through">{formatCurrency(price)}</span>
              )}
            </div>

            {cartItem ? (
              <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl p-1 border border-primary-100 dark:border-primary-900/30">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleUpdateQuantity(e, cartItem.quantity - 1)}
                  disabled={isProcessing}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-600 hover:bg-white dark:hover:bg-dark-600 disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="w-4 text-center font-bold text-sm text-primary-700 dark:text-primary-300">
                  {isProcessing ? <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /> : cartItem.quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleUpdateQuantity(e, cartItem.quantity + 1)}
                  disabled={isProcessing}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-600 hover:bg-white dark:hover:bg-dark-600 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={!isAvailable || isProcessing}
                className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-glow"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FoodCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-dark-600">
          <div className="skeleton h-6 w-16" />
          <div className="skeleton h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

FoodCard.Skeleton = FoodCardSkeleton;
export default FoodCard;
