import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Bike, Leaf } from 'lucide-react';
import { ROUTES } from '../constants';
import { formatCurrency } from '../utils';

function RestaurantCard({ restaurant, index = 0 }) {
  const { _id, name, description, coverImage, cuisine, avgRating, totalReviews, estimatedDeliveryTime, deliveryFee, isOpen } = restaurant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link
        to={`/restaurants/${_id}`}
        className="card block overflow-hidden group cursor-pointer"
      >
        {/* Image */}
        <div className="relative overflow-hidden h-48">
          <img
            src={coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Status Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isOpen ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
            {isOpen ? 'Open' : 'Closed'}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 dark:bg-dark-800/95 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800 dark:text-white">{avgRating?.toFixed(1) || '4.0'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-primary-500 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2 leading-relaxed">
            {description || cuisine?.join(' • ')}
          </p>

          {/* Cuisine Tags */}
          {cuisine && cuisine.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {cuisine.slice(0, 3).map((c) => (
                <span key={c} className="badge badge-primary">{c}</span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-dark-600 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{estimatedDeliveryTime || '30-45 mins'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bike className="w-3.5 h-3.5" />
              <span>{deliveryFee === 0 ? 'Free Delivery' : formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto text-gray-400 text-xs">
              {totalReviews > 0 && <span>{totalReviews} reviews</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RestaurantCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-4 pt-3 border-t border-gray-100 dark:border-dark-600">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

RestaurantCard.Skeleton = RestaurantCardSkeleton;
export default RestaurantCard;
