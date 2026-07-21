const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: [true, 'Coupon code is required'], unique: true, trim: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: [true, 'Discount type is required'] },
    discountValue: { type: Number, required: [true, 'Discount value is required'], min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null }, // cap for percentage discounts
    expiryDate: { type: Date, required: [true, 'Expiry date is required'] },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
