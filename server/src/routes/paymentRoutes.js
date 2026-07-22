const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);

module.exports = router;
