import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '../redux/api/wishlistApi';
import { useAddToCartMutation } from '../redux/api/foodApi';
import { openDrawer } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const foods = data?.data?.foods || [];

  const handleRemove = async (foodId, foodName) => {
    try {
      await removeFromWishlist(foodId).unwrap();
      toast.success(`${foodName} removed from wishlist`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (foodId, foodName) => {
    try {
      await addToCart({ foodId, quantity: 1 }).unwrap();
      dispatch(openDrawer());
      toast.success(`${foodName} added to cart!`);
    } catch (err) {
      if (err.data?.conflict) {
        toast.error(err.data.message, { duration: 5000 });
      } else {
        toast.error(err.data?.message || 'Failed to add to cart');
      }
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-red-500 fill-red-500" />
          <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white">My Wishlist</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex gap-4">
                  <div className="skeleton h-20 w-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Save your favourite dishes to find them easily later
            </p>
            <Link to="/restaurants" className="btn-primary">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {foods.map((food, i) => {
              const effectivePrice =
                food.discountPrice && food.discountPrice < food.price
                  ? food.discountPrice
                  : food.price;
              const hasDiscount = food.discountPrice && food.discountPrice < food.price;

              return (
                <motion.div
                  key={food._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="card p-4 flex gap-4 items-center">
                    {/* Food Image */}
                    <Link to={`/food/${food._id}`} className="flex-shrink-0">
                      <img
                        src={food.images?.[0] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                        alt={food.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    </Link>

                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/food/${food._id}`}
                        className="font-heading font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-1"
                      >
                        {food.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {food.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(effectivePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(food.price)}
                          </span>
                        )}
                        {!food.isAvailable && (
                          <span className="text-xs text-red-500 font-medium">Unavailable</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(food._id, food.name)}
                        disabled={!food.isAvailable}
                        title="Add to cart"
                        className="w-9 h-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-glow"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(food._id, food.name)}
                        title="Remove from wishlist"
                        className="w-9 h-9 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
