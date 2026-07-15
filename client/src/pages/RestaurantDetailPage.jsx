import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Bike, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { useGetRestaurantQuery } from '../redux/api/restaurantApi';
import FoodCard from '../components/FoodCard';
import { formatCurrency } from '../utils';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetRestaurantQuery(id);
  const [activeCategory, setActiveCategory] = useState('all');

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="skeleton h-64 md:h-80 w-full rounded-none" />
        <div className="container-custom mt-6 space-y-4">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-4 w-96" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array(6).fill(0).map((_, i) => <FoodCard.Skeleton key={i} />)}
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
          <h2 className="font-heading font-bold text-2xl text-gray-700 dark:text-gray-200 mb-2">Restaurant not found</h2>
          <Link to="/restaurants" className="btn-primary mt-4">Browse Restaurants</Link>
        </div>
      </div>
    );
  }

  const { restaurant, foods } = data.data;

  // Group foods by category
  const categoryMap = {};
  foods.forEach((food) => {
    const catName = food.category?.name || 'Other';
    if (!categoryMap[catName]) categoryMap[catName] = [];
    categoryMap[catName].push(food);
  });
  const categoryNames = Object.keys(categoryMap);

  const displayedFoods = activeCategory === 'all' ? foods : (categoryMap[activeCategory] || []);

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link to="/restaurants" className="absolute top-20 left-4 md:left-8 flex items-center gap-2 text-white font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-black/60 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container-custom">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {restaurant.isOpen ? (
                    <span className="badge bg-green-500 text-white">Open</span>
                  ) : (
                    <span className="badge bg-gray-500 text-white">Closed</span>
                  )}
                  {restaurant.cuisine?.map((c) => (
                    <span key={c} className="badge bg-white/20 text-white border border-white/30">{c}</span>
                  ))}
                </div>
                <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white">{restaurant.name}</h1>
                <p className="text-white/80 mt-1 max-w-lg">{restaurant.description}</p>
              </div>

              {/* Rating Card */}
              <div className="bg-white/95 dark:bg-dark-800/95 backdrop-blur-sm rounded-2xl p-4 min-w-[140px]">
                <div className="flex items-center gap-1 justify-center mb-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{restaurant.avgRating?.toFixed(1) || '4.0'}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">{restaurant.totalReviews} reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-600 sticky top-16 z-10">
        <div className="container-custom py-3 flex items-center gap-6 overflow-x-auto text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock className="w-4 h-4" />
            <span>{restaurant.estimatedDeliveryTime || '30-45 mins'}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Bike className="w-4 h-4" />
            <span>Delivery: {restaurant.deliveryFee === 0 ? 'Free' : formatCurrency(restaurant.deliveryFee)}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.address?.city}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{restaurant.openingHours?.open} - {restaurant.openingHours?.close}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container-custom py-8">
        {/* Category Tabs */}
        {categoryNames.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'}`}
            >
              All ({foods.length})
            </button>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'}`}
              >
                {cat} ({categoryMap[cat].length})
              </button>
            ))}
          </div>
        )}

        {/* Food Grid */}
        {displayedFoods.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 dark:text-gray-400">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedFoods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
