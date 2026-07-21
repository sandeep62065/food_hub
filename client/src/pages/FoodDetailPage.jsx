import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Leaf, ShoppingCart, ChevronLeft, Minus, Plus, Heart, Clock, Bike, Store } from 'lucide-react';
import { useGetFoodQuery } from '../redux/api/foodApi';
import { useAddToCartMutation, useClearCartMutation } from '../redux/api/foodApi';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '../redux/slices/authSlice';
import { openDrawer } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, error } = useGetFoodQuery(id);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [clearCart] = useClearCartMutation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container-custom max-w-5xl py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="skeleton h-80 rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <h2 className="font-heading font-bold text-2xl text-gray-700 dark:text-gray-200">Item not found</h2>
          <Link to="/restaurants" className="btn-primary mt-6">Browse Restaurants</Link>
        </div>
      </div>
    );
  }

  const food = data.data;
  const { name, description, images, price, discountPrice, isVeg, ingredients, avgRating, totalReviews, isAvailable, restaurant } = food;
  const effectivePrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice && discountPrice < price;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ foodId: id, quantity }).unwrap();
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
                  try {
                    await clearCart().unwrap();
                    await addToCart({ foodId: id, quantity }).unwrap();
                    toast.success(`${name} added to cart!`);
                  } catch (e) {
                    toast.error('Failed to add to cart');
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
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-custom max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <Link to="/restaurants" className="hover:text-primary-500">Restaurants</Link>
          {restaurant && (
            <>
              <span>/</span>
              <Link to={`/restaurants/${restaurant._id}`} className="hover:text-primary-500">{restaurant.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200">{name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden h-80 md:h-96 bg-gray-100 dark:bg-dark-700"
            >
              <img
                src={images?.[selectedImage] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'}
                alt={name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {images && images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500 scale-95' : 'border-transparent opacity-60 hover:opacity-80'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Veg Indicator */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${isVeg ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <span className={`text-sm font-medium ${isVeg ? 'text-green-600' : 'text-red-600'}`}>
                {isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              </span>
              {!isAvailable && <span className="badge badge-danger ml-2">Unavailable</span>}
            </div>

            <h1 className="font-heading font-extrabold text-3xl text-gray-900 dark:text-white mb-3">{name}</h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">{totalReviews} reviews</span>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{description}</p>

            {/* Restaurant Link */}
            {restaurant && (
              <Link to={`/restaurants/${restaurant._id}`} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-6 group">
                <Store className="w-4 h-4" />
                <span className="group-hover:underline">By {restaurant.name}</span>
                {restaurant.estimatedDeliveryTime && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{restaurant.estimatedDeliveryTime}</span>
                  </>
                )}
              </Link>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="font-heading font-extrabold text-4xl text-gray-900 dark:text-white">{formatCurrency(effectivePrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through mb-1">{formatCurrency(price)}</span>
                  <span className="badge badge-danger mb-1">
                    {Math.round(((price - discountPrice) / price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-700 rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-dark-600 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-dark-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isAvailable || isAdding}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart — {formatCurrency(effectivePrice * quantity)}
                  </>
                )}
              </button>
            </div>

            {/* Ingredients */}
            {ingredients && ingredients.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => (
                    <span key={ing} className="text-xs px-2.5 py-1 bg-white dark:bg-dark-600 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-500">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
