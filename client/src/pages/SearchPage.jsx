import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { useGetFoodsQuery } from '../redux/api/foodApi';
import { useGetRestaurantsQuery } from '../redux/api/restaurantApi';
import { useGetCategoriesQuery } from '../redux/api/otherApi';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import useDebounce from '../hooks/useDebounce';

const SORT_OPTIONS = [
  { value: '-avgRating', label: 'Top Rated' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
];

const RESTAURANT_SORT_OPTIONS = [
  { value: '-avgRating', label: 'Top Rated' },
  { value: 'deliveryFee', label: 'Delivery Fee' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [activeTab, setActiveTab] = useState('foods'); // 'foods' | 'restaurants'
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('-avgRating');
  
  // Filters
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [isVeg, setIsVeg] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);

  // Sync search param changes (e.g. from navbar)
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null && s !== search) {
      setSearch(s);
    }
  }, [searchParams.get('search')]);

  const debouncedSearch = useDebounce(search, 400);

  // Queries
  const foodQueryParams = {
    limit: 12,
    sort,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(isVeg && { isVeg: true }),
    ...(minRating > 0 && { 'avgRating[gte]': minRating }),
    ...(priceRange.min && { 'price[gte]': priceRange.min }),
    ...(priceRange.max && { 'price[lte]': priceRange.max }),
  };

  const restaurantQueryParams = {
    limit: 12,
    sort: activeTab === 'restaurants' && sort === 'price' ? '-avgRating' : sort, // restaurants don't have price sort
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCuisine && { cuisine: selectedCuisine }),
    ...(minRating > 0 && { 'avgRating[gte]': minRating }),
  };

  const { data: foodData, isFetching: isFetchingFoods } = useGetFoodsQuery(foodQueryParams, { skip: activeTab !== 'foods' });
  const { data: restaurantData, isFetching: isFetchingRestaurants } = useGetRestaurantsQuery(restaurantQueryParams, { skip: activeTab !== 'restaurants' });
  const { data: catData } = useGetCategoriesQuery();

  const foods = foodData?.data || [];
  const restaurants = restaurantData?.data || [];
  const categories = catData?.data || [];

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setSearchParams(e.target.value ? { search: e.target.value } : {});
  };

  const clearFilters = () => {
    setSelectedCuisine('');
    setIsVeg(false);
    setMinRating(0);
    setPriceRange({ min: '', max: '' });
    setSort('-avgRating');
  };

  const hasActiveFilters = selectedCuisine || isVeg || minRating > 0 || priceRange.min || priceRange.max;
  const isFetching = activeTab === 'foods' ? isFetchingFoods : isFetchingRestaurants;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-dark-900">
      <div className="container-custom">
        {/* Header Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for foods, cuisines, or restaurants..."
              value={search}
              onChange={handleSearch}
              className="input pl-12 py-4 text-lg w-full shadow-sm"
              autoFocus
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchParams({}); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 btn-secondary w-full"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Sidebar Filters */}
          <div className={`lg:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-dark-600">
                <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600 font-medium">Clear All</button>
                )}
              </div>

              {/* Veg Toggle (Foods only) */}
              {activeTab === 'foods' && (
                <div className="mb-6">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Veg Only</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isVeg ? 'bg-green-500' : 'bg-gray-300 dark:bg-dark-600'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isVeg ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              )}

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating" 
                        checked={minRating === rating} 
                        onChange={() => setMinRating(rating)}
                        className="text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{rating}+ Stars</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range (Foods only) */}
              {activeTab === 'foods' && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Range (₹)</h4>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={priceRange.min} 
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="input text-sm p-2 w-full"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={priceRange.max} 
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="input text-sm p-2 w-full"
                    />
                  </div>
                </div>
              )}

              {/* Cuisines (Restaurants only) */}
              {activeTab === 'restaurants' && categories.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Cuisines</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="cuisine"
                          checked={selectedCuisine === cat.name} 
                          onChange={() => setSelectedCuisine(cat.name)}
                          className="text-primary-500 focus:ring-primary-500 rounded-full"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Tabs & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex bg-white dark:bg-dark-800 p-1 rounded-xl shadow-sm inline-flex">
                <button
                  onClick={() => setActiveTab('foods')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'foods' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Foods
                </button>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'restaurants' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Restaurants
                </button>
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input appearance-none pr-8 cursor-pointer min-w-[160px] text-sm py-2.5"
                >
                  {(activeTab === 'foods' ? SORT_OPTIONS : RESTAURANT_SORT_OPTIONS).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Results Grid */}
            {isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => activeTab === 'foods' ? <FoodCard.Skeleton key={i} /> : <RestaurantCard.Skeleton key={i} />)}
              </div>
            ) : activeTab === 'foods' ? (
              foods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {foods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700">
                  <p className="text-5xl mb-4">🔍</p>
                  <h3 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200 mb-2">No foods found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              )
            ) : (
              restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700">
                  <p className="text-5xl mb-4">🍽️</p>
                  <h3 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200 mb-2">No restaurants found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
