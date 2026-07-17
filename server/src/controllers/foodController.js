const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc   Get all foods (public)
// @route  GET /api/v1/foods
const getFoods = async (req, res, next) => {
  try {
    const baseQuery = Food.find({ isAvailable: true }).populate('category', 'name slug').populate('restaurant', 'name address');
    const features = new ApiFeatures(baseQuery, req.query)
      .search('name description')
      .filter()
      .sort()
      .paginate(16);

    const foods = await features.query;
    const total = await Food.countDocuments({ isAvailable: true });

    res.json({
      success: true,
      data: foods,
      pagination: { page: features.page, limit: features.limit, total, totalPages: Math.ceil(total / features.limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single food (public)
// @route  GET /api/v1/foods/:id
const getFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('restaurant', 'name address avgRating isOpen deliveryFee estimatedDeliveryTime');

    if (!food) return next(new AppError('Food item not found', 404));
    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// Helper: verify owner owns the restaurant this food belongs to
const verifyOwner = async (foodId, userId) => {
  const food = await Food.findById(foodId).populate('restaurant');
  if (!food) return { error: 'Food not found', status: 404 };
  if (food.restaurant.owner.toString() !== userId.toString()) {
    return { error: 'Not authorized', status: 403 };
  }
  return { food };
};

// @desc   Add food (owner)
// @route  POST /api/v1/foods
const addFood = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('Create a restaurant first', 400));
    if (!restaurant.isApproved) return next(new AppError('Your restaurant is pending approval', 403));

    const { name, description, category, price, discountPrice, isVeg, ingredients } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const { url } = await uploadToCloudinary(file.buffer, 'foodiehub/foods');
          images.push(url);
        } catch {}
      }
    }

    const ingredientsArr = typeof ingredients === 'string' ? ingredients.split(',').map((i) => i.trim()) : ingredients || [];

    const food = await Food.create({
      restaurant: restaurant._id,
      name,
      description,
      category,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      isVeg: isVeg === 'true' || isVeg === true,
      ingredients: ingredientsArr,
      images,
    });

    res.status(201).json({ success: true, message: 'Food added', data: food });
  } catch (error) {
    next(error);
  }
};

// @desc   Update food (owner)
// @route  PATCH /api/v1/foods/:id
const updateFood = async (req, res, next) => {
  try {
    const { error, status, food } = await verifyOwner(req.params.id, req.user._id);
    if (error && req.user.role !== 'admin') return next(new AppError(error, status));

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const { url } = await uploadToCloudinary(file.buffer, 'foodiehub/foods');
          newImages.push(url);
        } catch {}
      }
      if (newImages.length > 0) req.body.images = newImages;
    }

    if (typeof req.body.isVeg !== 'undefined') {
      req.body.isVeg = req.body.isVeg === 'true' || req.body.isVeg === true;
    }

    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Food updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete food (owner)
// @route  DELETE /api/v1/foods/:id
const deleteFood = async (req, res, next) => {
  try {
    const { error, status } = await verifyOwner(req.params.id, req.user._id);
    if (error && req.user.role !== 'admin') return next(new AppError(error, status));

    await Food.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get foods by restaurant (public)
// @route  GET /api/v1/foods/restaurant/:restaurantId
const getFoodsByRestaurant = async (req, res, next) => {
  try {
    const foods = await Food.find({ restaurant: req.params.restaurantId, isAvailable: true })
      .populate('category', 'name slug')
      .sort('category name');
    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
};

// @desc   Get owner foods
// @route  GET /api/v1/foods/owner/my-foods
const getOwnerFoods = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    const filter = { restaurant: restaurant._id };
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';

    const foods = await Food.find(filter)
      .populate('category', 'name slug')
      .sort('-createdAt');
      
    res.json({ success: true, data: foods });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoods, getFood, addFood, updateFood, deleteFood, getFoodsByRestaurant, getOwnerFoods };
