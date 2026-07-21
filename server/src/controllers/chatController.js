const ChatMessage = require('../models/ChatMessage');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// @desc   Get chat messages for an order
// @route  GET /api/v1/chat/:orderId/messages
const getMessagesForOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const isCustomer = order.user.toString() === req.user._id.toString();
    const isPartner = order.deliveryPartner && order.deliveryPartner.toString() === req.user._id.toString();

    if (!isCustomer && !isPartner) {
      return next(new AppError('Not authorized to access this chat', 403));
    }

    const messages = await ChatMessage.find({ order: orderId }).sort('createdAt');

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessagesForOrder,
};
