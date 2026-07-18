import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Star, Leaf } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openDrawer } from '../redux/slices/cartSlice';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { useAddToCartMutation } from '../redux/api/foodApi';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function FoodCard({ food, index = 0 }) {
  const { _id, name, description, images, price, discountPrice, isVeg, avgRating, isAvailable } = food;
  const [isAdding, setIsAdding] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [addToCart] = useAddToCartMutation();

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
      dispatch(openDrawer());
      toast.success(`${name} added to cart!`);
    } catch (err) {
      if (err.data?.conflict) {
        toast.error(err.data.message, { duration: 5000 });
      } else {
        toast.error(err.data?.message || 'Failed to add to cart');
      }
    } finally {
      setIsAdding(false);
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

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={!isAvailable || isAdding}
              className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-glow"
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </motion.button>
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
