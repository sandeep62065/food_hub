const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder, cancelOrder, updateOrderStatus, getRestaurantOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/restaurant', authorize('owner'), getRestaurantOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize('owner', 'admin'), updateOrderStatus);

module.exports = router;
