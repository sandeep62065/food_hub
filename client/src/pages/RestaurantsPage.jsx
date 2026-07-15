import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useGetRestaurantsQuery } from '../redux/api/restaurantApi';
import { useGetCategoriesQuery } from '../redux/api/otherApi';
import RestaurantCard from '../components/RestaurantCard';
import useDebounce from '../hooks/useDebounce';

const SORT_OPTIONS = [
  { value: '-avgRating', label: 'Top Rated' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'deliveryFee', label: 'Delivery Fee' },
];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('-avgRating');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [page, setPage] = useState(1);
  const [isVegOnly, setIsVegOnly] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams = {
    page,
    limit: 9,
    sort,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCuisine && { cuisine: selectedCuisine }),
  };

  const { data, isLoading, isFetching } = useGetRestaurantsQuery(queryParams);
  const { data: catData } = useGetCategoriesQuery();

  const restaurants = data?.data || [];
  const pagination = data?.pagination;
  const categories = catData?.data || [];

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCuisineSelect = (slug) => {
    setSelectedCuisine(selectedCuisine === slug ? '' : slug);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCuisine('');
    setSort('-avgRating');
    setPage(1);
  };

  const hasActiveFilters = search || selectedCuisine;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">
            All Restaurants
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {pagination ? `${pagination.total} restaurants available` : 'Discover delicious options near you'}
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={search}
                onChange={handleSearch}
                className="input pl-10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input appearance-none pr-8 cursor-pointer min-w-[140px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Cuisine Filter Chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCuisineSelect(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    selectedCuisine === cat.slug
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-600 hover:border-primary-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => <RestaurantCard.Skeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <h3 className="font-heading font-bold text-xl text-gray-700 dark:text-gray-200 mb-2">No restaurants found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === p ? 'bg-primary-500 text-white' : 'btn-ghost'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
