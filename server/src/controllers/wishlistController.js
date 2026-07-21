const Wishlist = require('../models/Wishlist');
const Food = require('../models/Food');
const AppError = require('../utils/AppError');

// Helper: populate wishlist foods fully
const populatedWishlist = (wishlistQuery) =>
  wishlistQuery.populate('foods', 'name images price discountPrice isAvailable isVeg avgRating description restaurant');

// @desc   Get my wishlist
// @route  GET /api/v1/wishlist
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await populatedWishlist(Wishlist.findOne({ user: req.user._id }));
    if (!wishlist) {
      wishlist = { user: req.user._id, foods: [] };
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc   Add food to wishlist
// @route  POST /api/v1/wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    const food = await Food.findById(foodId);
    if (!food) return next(new AppError('Food item not found', 404));

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, foods: [] });
    }

    // Prevent duplicates
    if (wishlist.foods.map((f) => f.toString()).includes(foodId)) {
      return res.json({ success: true, message: 'Already in wishlist', data: await populatedWishlist(Wishlist.findById(wishlist._id)) });
    }

    wishlist.foods.push(foodId);
    await wishlist.save();

    const updatedWishlist = await populatedWishlist(Wishlist.findById(wishlist._id));
    res.json({ success: true, message: `${food.name} added to wishlist`, data: updatedWishlist });
  } catch (error) {
    next(error);
  }
};

// @desc   Remove food from wishlist
// @route  DELETE /api/v1/wishlist/:foodId
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return next(new AppError('Wishlist not found', 404));

    const foodIndex = wishlist.foods.map((f) => f.toString()).indexOf(req.params.foodId);
    if (foodIndex === -1) return next(new AppError('Food item not found in wishlist', 404));

    wishlist.foods.splice(foodIndex, 1);
    await wishlist.save();

    const updatedWishlist = await populatedWishlist(Wishlist.findById(wishlist._id));
    res.json({ success: true, message: 'Removed from wishlist', data: updatedWishlist });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
