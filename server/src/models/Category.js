const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true },
    image: { type: String, default: '' },
    slug: { type: String, unique: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
