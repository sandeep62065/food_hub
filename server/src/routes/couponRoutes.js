const express = require('express');
const router = express.Router();
const { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, authorize } = require('../middlewares/auth');

// Any logged-in user can validate
router.post('/validate', protect, validateCoupon);

// Admin-only CRUD
router.use(protect, authorize('admin'));
router.get('/', getCoupons);
router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
