const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: [true, 'Food name is required'], trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    images: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, min: 0 },
    isVeg: { type: Boolean, default: true },
    ingredients: [{ type: String }],
    stock: { type: Number, default: 100 },
    isAvailable: { type: Boolean, default: true },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', description: 'text' });

// Virtual for effective price
foodSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

foodSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Food', foodSchema);
