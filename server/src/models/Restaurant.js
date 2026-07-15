const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    coverImage: { type: String, default: '' },
    cuisine: [{ type: String, trim: true }],
    address: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String },
      pincode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    openingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
    },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 30 },
    minOrderAmount: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: '30-45 mins' },
  },
  { timestamps: true }
);

// Index for search
restaurantSchema.index({ name: 'text', 'address.city': 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
