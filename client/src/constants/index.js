export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurants/:id',
  FOOD_DETAIL: '/food/:id',
  OFFERS: '/offers',
  CONTACT: '/contact',
  FAQ: '/faq',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Customer
  PROFILE: '/profile',
  WISHLIST: '/wishlist',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  ADDRESSES: '/addresses',
  SETTINGS: '/settings',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_RESTAURANTS: '/admin/restaurants',
  ADMIN_FOODS: '/admin/foods',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COUPONS: '/admin/coupons',

  // Owner
  OWNER: '/owner',
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_FOODS: '/owner/foods',
  OWNER_FOODS_ADD: '/owner/foods/add',
  OWNER_FOODS_EDIT: '/owner/foods/:id/edit',
  OWNER_ORDERS: '/owner/orders',
  OWNER_REVIEWS: '/owner/reviews',
  
  // Delivery
  DELIVERY: '/delivery',
  DELIVERY_DASHBOARD: '/delivery/dashboard',
  DELIVERY_ORDER: '/delivery/order/:id',
};

export const ORDER_STATUSES = {
  placed: { label: 'Order Placed', color: 'blue', icon: '📋' },
  confirmed: { label: 'Confirmed', color: 'indigo', icon: '✅' },
  preparing: { label: 'Preparing', color: 'amber', icon: '👨‍🍳' },
  out_for_delivery: { label: 'On the Way', color: 'orange', icon: '🛵' },
  delivered: { label: 'Delivered', color: 'green', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '❌' },
};

export const ROLES = {
  CUSTOMER: 'customer',
  OWNER: 'owner',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
};

export const PAYMENT_METHODS = {
  COD: 'COD',
  RAZORPAY: 'Razorpay',
};

export const GST_RATE = 0.05;
