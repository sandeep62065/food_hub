const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const slugify = require('slugify');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc   Get all categories (public)
// @route  GET /api/v1/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc   Create category (admin)
// @route  POST /api/v1/categories
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });

    let image = '';
    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.buffer, 'foodiehub/categories');
        image = url;
      } catch {}
    }

    const category = await Category.create({ name, slug, image });
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc   Update category (admin)
// @route  PATCH /api/v1/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true });
    }
    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.buffer, 'foodiehub/categories');
        updateData.image = url;
      } catch {}
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete category (admin)
// @route  DELETE /api/v1/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
