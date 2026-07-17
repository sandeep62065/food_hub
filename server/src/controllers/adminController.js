const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

// @desc   Dashboard stats
// @route  GET /api/v1/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRestaurants, totalOrders, totalFoods, pendingRestaurants] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments({ isApproved: true }),
      Order.countDocuments(),
      Food.countDocuments(),
      Restaurant.countDocuments({ isApproved: false }),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort('-createdAt')
      .limit(5);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalRestaurants, totalOrders, totalFoods, totalRevenue, pendingRestaurants },
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all users
// @route  GET /api/v1/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
      ];
    }

    const users = await User.find(filter).sort('-createdAt').skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.json({ success: true, data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc   Ban/Unban user
// @route  PATCH /api/v1/admin/users/:id/ban
const toggleBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot ban admin accounts', 403));

    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all restaurants (admin)
// @route  GET /api/v1/admin/restaurants
const getAllRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');

    const restaurants = await Restaurant.find(filter).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(limit);
    const total = await Restaurant.countDocuments(filter);

    res.json({ success: true, data: restaurants, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc   Approve / Reject restaurant
// @route  PATCH /api/v1/admin/restaurants/:id/approval
const updateRestaurantApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!restaurant) return next(new AppError('Restaurant not found', 404));
    res.json({ success: true, message: `Restaurant ${isApproved ? 'approved' : 'rejected'}`, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all orders (admin)
// @route  GET /api/v1/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
    const total = await Order.countDocuments(filter);

    res.json({ success: true, data: orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete restaurant (admin)
// @route  DELETE /api/v1/admin/restaurants/:id
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return next(new AppError('Restaurant not found', 404));
    await Food.deleteMany({ restaurant: req.params.id });
    res.json({ success: true, message: 'Restaurant and its foods deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all foods (admin)
// @route  GET /api/v1/admin/foods
const getAllFoods = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) filter.name = new RegExp(req.query.search, 'i');
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';

    const foods = await Food.find(filter)
      .populate('restaurant', 'name')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
      
    const total = await Food.countDocuments(filter);

    res.json({ success: true, data: foods, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleBan, getAllRestaurants, updateRestaurantApproval, getAllOrders, deleteRestaurant, getAllFoods };
