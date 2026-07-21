const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');

// Shared helper: compute discount amount from a validated coupon doc + subtotal
const computeDiscount = (coupon, cartSubtotal) => {
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }
  // Discount cannot exceed subtotal
  return Math.min(discountAmount, cartSubtotal);
};

// @desc   Validate a coupon code (any logged-in user)
// @route  POST /api/v1/coupons/validate
const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartSubtotal } = req.body;
    if (!code) return next(new AppError('Coupon code is required', 400));
    if (!cartSubtotal || cartSubtotal <= 0) return next(new AppError('Invalid cart subtotal', 400));

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) return next(new AppError('Invalid coupon code', 404));
    if (!coupon.isActive) return next(new AppError('This coupon is no longer active', 400));
    if (new Date() > coupon.expiryDate) return next(new AppError('This coupon has expired', 400));
    if (cartSubtotal < coupon.minOrderAmount) {
      return next(new AppError(`Minimum order amount of ${coupon.minOrderAmount} required for this coupon`, 400));
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('This coupon has reached its usage limit', 400));
    }

    const discountAmount = computeDiscount(coupon, cartSubtotal);

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all coupons (admin)
// @route  GET /api/v1/coupons
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc   Create coupon (admin)
// @route  POST /api/v1/coupons
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit } = req.body;
    const coupon = await Coupon.create({ code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit });
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc   Update coupon (admin)
// @route  PATCH /api/v1/coupons/:id
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return next(new AppError('Coupon not found', 404));
    res.json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete coupon (admin)
// @route  DELETE /api/v1/coupons/:id
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError('Coupon not found', 404));
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon, computeDiscount };
