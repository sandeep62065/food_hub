const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const Coupon = require('../models/Coupon');
const { computeDiscount } = require('./couponController');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');
const { sendEmail, orderConfirmationEmail } = require('../utils/sendEmail');

const GST_RATE = 0.05; // 5%

// @desc   Place order
// @route  POST /api/v1/orders
const placeOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod = 'COD', couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food restaurant');
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    // Build order items (snapshot prices)
    const items = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      price: item.price,
      quantity: item.quantity,
      image: item.food.images?.[0] || '',
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = restaurant.deliveryFee || 30;
    const gst = Math.round(subtotal * GST_RATE);

    // --- Coupon validation (optional) ---
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (
        coupon &&
        coupon.isActive &&
        new Date() <= coupon.expiryDate &&
        subtotal >= coupon.minOrderAmount &&
        (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit)
      ) {
        discount = computeDiscount(coupon, subtotal);
        appliedCoupon = coupon;
      }
    }

    const grandTotal = subtotal + deliveryFee + gst - discount;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items,
      deliveryAddress,
      subtotal,
      deliveryFee,
      gst,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
      orderStatus: 'placed',
      statusHistory: [{ status: 'placed', timestamp: new Date() }],
    });

    // Increment coupon usedCount after order is created
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], restaurant: undefined });

    // Send confirmation email (non-blocking)
    const emailContent = orderConfirmationEmail(req.user.name, order);
    sendEmail({ to: req.user.email, ...emailContent }).catch(console.error);

    const populatedOrder = await Order.findById(order._id)
      .populate('restaurant', 'name coverImage address')
      .populate('items.food', 'name images');

    res.status(201).json({ success: true, message: 'Order placed successfully!', data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc   Get my orders
// @route  GET /api/v1/orders
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name coverImage address')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get order by ID
// @route  GET /api/v1/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name coverImage address phone')
      .populate('user', 'name email phone');

    if (!order) return next(new AppError('Order not found', 404));

    // Only allow owner, the restaurant owner, or admin
    const isCustomer = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCustomer && !isAdmin) {
      return next(new AppError('Not authorized to view this order', 403));
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc   Cancel order
// @route  PATCH /api/v1/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return next(new AppError('Order not found', 404));

    const cancellableStatuses = ['placed', 'confirmed'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return next(new AppError('Order cannot be cancelled at this stage', 400));
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: order.cancelReason });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc   Update order status (owner/admin)
// @route  PATCH /api/v1/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return next(new AppError(`Invalid status. Valid: ${validStatuses.join(', ')}`, 400));
    }

    const order = await Order.findById(req.params.id).populate('restaurant');
    if (!order) return next(new AppError('Order not found', 404));

    // Owner can only update their own restaurant's orders
    if (req.user.role === 'owner') {
      if (order.restaurant.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
      }
    }

    order.orderStatus = status;
    if (status === 'delivered') order.paymentStatus = 'paid';
    order.statusHistory.push({ status, timestamp: new Date(), note });
    await order.save();

    res.json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc   Get orders for owner's restaurant
// @route  GET /api/v1/orders/restaurant
const getRestaurantOrders = async (req, res, next) => {
  try {
    const restaurant = await require('../models/Restaurant').findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('Restaurant not found', 404));

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { restaurant: restaurant._id };
    if (req.query.status) filter.orderStatus = req.query.status;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder, updateOrderStatus, getRestaurantOrders };
