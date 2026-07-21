const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc   Get all approved restaurants (public)
// @route  GET /api/v1/restaurants
const getRestaurants = async (req, res, next) => {
  try {
    let queryObj = { isApproved: true };

    if (req.query.cuisine) {
      queryObj.cuisine = new RegExp(req.query.cuisine, 'i');
      delete req.query.cuisine; // Prevent filter() from overriding this with a strict match
    }

    const baseQuery = Restaurant.find(queryObj);
    const features = new ApiFeatures(baseQuery, req.query)
      .search('name cuisine')
      .filter()
      .sort()
      .paginate(12);

    const restaurants = await features.query.populate('owner', 'name email');
    const total = await Restaurant.countDocuments(queryObj);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: features.page,
        limit: features.limit,
        total,
        totalPages: Math.ceil(total / features.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single restaurant (public)
// @route  GET /api/v1/restaurants/:id
const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isApproved: true }).populate('owner', 'name email');
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    // Get food menu grouped by category
    const foods = await Food.find({ restaurant: restaurant._id, isAvailable: true }).populate('category', 'name slug');

    res.json({ success: true, data: { restaurant, foods } });
  } catch (error) {
    next(error);
  }
};

// @desc   Create restaurant (owner)
// @route  POST /api/v1/restaurants
const createRestaurant = async (req, res, next) => {
  try {
    // One restaurant per owner
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) return next(new AppError('You already have a registered restaurant', 409));

    const { name, description, cuisine, address, openingHours, deliveryFee, minOrderAmount, estimatedDeliveryTime } = req.body;

    let coverImage = '';
    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.buffer, 'foodiehub/restaurants');
        coverImage = url;
      } catch (err) {
        console.error('Image upload failed:', err.message);
      }
    }

    const cuisineArray = typeof cuisine === 'string' ? cuisine.split(',').map((c) => c.trim()) : cuisine;
    const addressObj = typeof address === 'string' ? JSON.parse(address) : address;
    const hoursObj = typeof openingHours === 'string' ? JSON.parse(openingHours) : openingHours;

    const restaurant = await Restaurant.create({
      owner: req.user._id,
      name,
      description,
      cuisine: cuisineArray,
      address: addressObj,
      openingHours: hoursObj,
      coverImage,
      deliveryFee,
      minOrderAmount,
      estimatedDeliveryTime,
    });

    res.status(201).json({ success: true, message: 'Restaurant submitted for approval', data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc   Update restaurant (owner of this restaurant)
// @route  PATCH /api/v1/restaurants/:id
const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this restaurant', 403));
    }

    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.buffer, 'foodiehub/restaurants');
        req.body.coverImage = url;
      } catch {}
    }

    // Parse JSON strings if sent from form-data
    if (typeof req.body.address === 'string') req.body.address = JSON.parse(req.body.address);
    if (typeof req.body.openingHours === 'string') req.body.openingHours = JSON.parse(req.body.openingHours);
    if (typeof req.body.cuisine === 'string') req.body.cuisine = req.body.cuisine.split(',').map((c) => c.trim());

    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Restaurant updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc   Get owner's own restaurant
// @route  GET /api/v1/restaurants/mine
const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('No restaurant found. Please create one.', 404));
    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, getMyRestaurant };
