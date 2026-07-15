import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Star, Clock, Bike, ArrowRight, UtensilsCrossed, Zap, Shield, Smile } from 'lucide-react';
import { useGetRestaurantsQuery } from '../redux/api/restaurantApi';
import { useGetCategoriesQuery } from '../redux/api/otherApi';
import RestaurantCard from '../components/RestaurantCard';
import { ROUTES } from '../constants';

const HERO_SLIDES = [
  { bg: 'from-orange-600 to-red-500', label: 'Spicy & Hot' },
  { bg: 'from-purple-600 to-indigo-500', label: 'Premium Dining' },
  { bg: 'from-green-600 to-teal-500', label: 'Healthy Choices' },
];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Choose Restaurant', desc: 'Browse hundreds of top-rated restaurants near you', step: '01' },
  { icon: UtensilsCrossed, title: 'Select Your Meal', desc: 'Pick from diverse menus with veg & non-veg options', step: '02' },
  { icon: Bike, title: 'Fast Delivery', desc: 'Track your order in real-time as it comes to you', step: '03' },
  { icon: Smile, title: 'Enjoy!', desc: 'Sit back, relax, and enjoy restaurant-quality food at home', step: '04' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  const { data: restaurantData, isLoading: restaurantsLoading } = useGetRestaurantsQuery({ limit: 6 });
  const { data: categoryData } = useGetCategoriesQuery();

  const restaurants = restaurantData?.data || [];
  const categories = categoryData?.data || [];

  useEffect(() => {
    const interval = setInterval(() => setSlideIndex((i) => (i + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`${ROUTES.RESTAURANTS}?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className={`relative min-h-screen flex items-center justify-center bg-gradient-to-br ${HERO_SLIDES[slideIndex].bg} overflow-hidden transition-all duration-1000`}>
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="container-custom text-center text-white relative z-10 pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              30-45 min delivery to your door
            </span>

            <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-tight mb-6">
              Food you love,<br />
              <span className="text-yellow-300">delivered fast</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10">
              Discover the best restaurants in Bangalore. Order from your favorites or explore something new.
            </p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-white dark:bg-dark-800 rounded-2xl p-2 max-w-xl mx-auto shadow-2xl"
            >
              <Search className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm py-1"
              />
              <button type="submit" className="btn-primary text-sm px-5 py-2 rounded-xl whitespace-nowrap">
                Find Food
              </button>
            </motion.form>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-12">
              {[
                { value: '4+', label: 'Restaurants' },
                { value: '16+', label: 'Food Items' },
                { value: '4.7★', label: 'Avg Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold font-heading text-yellow-300">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section bg-white dark:bg-dark-800">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">
                What are you <span className="text-gradient">craving?</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-10">Explore by cuisine category</p>
            </motion.div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`${ROUTES.RESTAURANTS}?cuisine=${cat.slug}`}
                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-700 group-hover:ring-2 group-hover:ring-primary-400 transition-all">
                      <img src={cat.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100'} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      <section className="section bg-gray-50 dark:bg-dark-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
                Top <span className="text-gradient">Restaurants</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Highly rated by our customers</p>
            </motion.div>
            <Link to={ROUTES.RESTAURANTS} className="btn-secondary text-sm hidden sm:flex">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {restaurantsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <RestaurantCard.Skeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to={ROUTES.RESTAURANTS} className="btn-primary">
              Explore All Restaurants <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-white dark:bg-dark-800">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
              How <span className="text-gradient">FoodieHub</span> Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Getting your favorite meal delivered is easier than ever
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 transition-colors duration-300">
                    <step.icon className="w-7 h-7 text-primary-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section bg-gradient-to-r from-primary-600 to-primary-400">
        <div className="container-custom text-center text-white">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
              Ready to order? 🍔
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of happy customers who get their favorite meals delivered daily.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={ROUTES.REGISTER} className="px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Get Started Free
              </Link>
              <Link to={ROUTES.RESTAURANTS} className="px-8 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                Browse Restaurants
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
