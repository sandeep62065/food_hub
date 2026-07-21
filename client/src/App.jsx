import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useGetMeQuery } from './redux/api/otherApi';
import { setCredentials, logout } from './redux/slices/authSlice';
import { ROUTES } from './constants';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import AdminLayout from './layouts/AdminLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Public / Auth Pages
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import FoodDetailPage from './pages/FoodDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Customer Pages
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminFoodsPage from './pages/admin/AdminFoodsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage';
import OwnerFoodsPage from './pages/owner/OwnerFoodsPage';
import AddFoodPage from './pages/owner/AddFoodPage';
import CreateRestaurantPage from './pages/owner/CreateRestaurantPage';

// Delivery Pages
import DeliveryLayout from './layouts/DeliveryLayout';
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import ActiveDeliveryPage from './pages/delivery/ActiveDeliveryPage';

export default function App() {
  const dispatch = useDispatch();
  const [initFinished, setInitFinished] = useState(false);
  const { data, error, isLoading } = useGetMeQuery(undefined, { skip: false });

  useEffect(() => {
    const initTheme = () => {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    initTheme();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (data?.data) {
        dispatch(setCredentials({ user: data.data, accessToken: null })); // access token handled by cookies/interceptor on refresh
      } else if (error) {
        dispatch(logout());
      }
      setInitFinished(true);
    }
  }, [data, error, isLoading, dispatch]);

  if (!initFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #333)',
            color: '#fff',
            borderRadius: '12px',
          },
        }} 
      />
      
      <Routes>
        {/* Auth Routes (no layout) */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        {/* Public Routes with standard Layout */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.RESTAURANTS} element={<RestaurantsPage />} />
          <Route path={ROUTES.RESTAURANT_DETAIL} element={<RestaurantDetailPage />} />
          <Route path={ROUTES.FOOD_DETAIL} element={<FoodDetailPage />} />
          
          {/* Static informational pages (can be placeholders) */}
          <Route path={ROUTES.ABOUT} element={<div className="container-custom py-20 text-center"><h1 className="text-3xl font-bold">About Us</h1><p className="mt-4">FoodieHub is the best food delivery platform.</p></div>} />
          <Route path={ROUTES.CONTACT} element={<div className="container-custom py-20 text-center"><h1 className="text-3xl font-bold">Contact Us</h1><p className="mt-4">Reach us at support@foodiehub.com</p></div>} />
          <Route path={ROUTES.OFFERS} element={<div className="container-custom py-20 text-center"><h1 className="text-3xl font-bold">Latest Offers</h1><p className="mt-4">Use code FOODIE50 for 50% off!</p></div>} />
          <Route path={ROUTES.FAQ} element={<div className="container-custom py-20 text-center"><h1 className="text-3xl font-bold">FAQ</h1><p className="mt-4">Common questions and answers.</p></div>} />
        </Route>

        {/* Customer Private Routes */}
        <Route element={<PrivateLayout allowedRoles={['customer']} />}>
          <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
          <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
          <Route path={ROUTES.ORDER_DETAIL} element={<OrderDetailPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.ADDRESSES} element={<ProfilePage />} />
          <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_RESTAURANTS} element={<AdminRestaurantsPage />} />
          <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
          <Route path={ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
          <Route path={ROUTES.ADMIN_COUPONS} element={<AdminCouponsPage />} />
          {/* Placeholders for others */}
          <Route path={ROUTES.ADMIN_FOODS} element={<AdminFoodsPage />} />
        </Route>

        {/* Owner Routes */}
        <Route element={<OwnerLayout />}>
          <Route path={ROUTES.OWNER} element={<Navigate to={ROUTES.OWNER_DASHBOARD} replace />} />
          <Route path={ROUTES.OWNER_DASHBOARD} element={<OwnerDashboardPage />} />
          <Route path={ROUTES.OWNER_ORDERS} element={<OwnerOrdersPage />} />
          <Route path={ROUTES.OWNER_FOODS} element={<OwnerFoodsPage />} />
          <Route path={ROUTES.OWNER_FOODS_ADD} element={<AddFoodPage />} />
          <Route path="/owner/create-restaurant" element={<CreateRestaurantPage />} />
          {/* Placeholders */}
          <Route path={ROUTES.OWNER_REVIEWS} element={<div className="p-8"><h1 className="text-2xl font-bold">Reviews</h1></div>} />
        </Route>

        {/* Delivery Routes */}
        <Route element={<DeliveryLayout />}>
          <Route path={ROUTES.DELIVERY} element={<Navigate to={ROUTES.DELIVERY_DASHBOARD} replace />} />
          <Route path={ROUTES.DELIVERY_DASHBOARD} element={<DeliveryDashboardPage />} />
          <Route path={ROUTES.DELIVERY_ORDER} element={<ActiveDeliveryPage />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-500 mb-6">Page not found</p>
            <button onClick={() => window.history.back()} className="btn-primary">Go Back</button>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
