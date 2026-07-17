const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// @desc    Get available orders for delivery (status: preparing and no partner assigned)
// @route   GET /api/v1/delivery/orders/available
const getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      orderStatus: 'preparing',
      deliveryPartner: { $exists: false }
    })
      .populate('restaurant', 'name address coverImage')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my deliveries
// @route   GET /api/v1/delivery/orders/my
const getMyDeliveries = async (req, res, next) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user._id })
      .populate('restaurant', 'name address coverImage')
      .populate('user', 'name phone')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an order
// @route   PATCH /api/v1/delivery/orders/:id/accept
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    
    if (order.deliveryPartner) {
      return next(new AppError('Order already accepted by another partner', 400));
    }

    order.deliveryPartner = req.user._id;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/v1/delivery/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['out_for_delivery', 'delivered'].includes(status)) {
      return next(new AppError('Invalid status update', 400));
    }

    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user._id });
    if (!order) return next(new AppError('Order not found or not assigned to you', 404));

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note: `Updated by delivery partner`
    });

    await order.save();
    
    // notify socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order-status-updated', { status });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery location
// @route   PATCH /api/v1/delivery/orders/:id/location
const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return next(new AppError('Latitude and longitude are required', 400));
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, deliveryPartner: req.user._id },
      { partnerLocation: { lat, lng } },
      { new: true }
    );

    if (!order) {
      return next(new AppError('Order not found or not assigned to you', 404));
    }

    // Still try to emit via socket for fast updates if it works locally
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('location-updated', { lat, lng });
    }

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableOrders,
  getMyDeliveries,
  acceptOrder,
  updateOrderStatus,
  updateLocation
};
