const express = require('express');
const router = express.Router();
const {
  getAvailableOrders,
  getMyDeliveries,
  acceptOrder,
  updateOrderStatus
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('delivery_partner'));

router.get('/orders/available', getAvailableOrders);
router.get('/orders/my', getMyDeliveries);
router.patch('/orders/:id/accept', acceptOrder);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
