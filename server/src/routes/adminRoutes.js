const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, toggleBan, getAllRestaurants, updateRestaurantApproval, getAllOrders, deleteRestaurant, getAllFoods
} = require('../controllers/adminController');
const {
  getLoyaltySettings, updateLoyaltySettings, getLoyaltyStats, adjustUserPoints
} = require('../controllers/loyaltyAdminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/ban', toggleBan);

router.get('/restaurants', getAllRestaurants);
router.patch('/restaurants/:id/approval', updateRestaurantApproval);
router.delete('/restaurants/:id', deleteRestaurant);

router.get('/orders', getAllOrders);

router.get('/foods', getAllFoods);

// Loyalty endpoints
router.get('/loyalty/settings', getLoyaltySettings);
router.patch('/loyalty/settings', updateLoyaltySettings);
router.get('/loyalty/stats', getLoyaltyStats);
router.patch('/loyalty/users/:id/adjust', adjustUserPoints);

module.exports = router;
