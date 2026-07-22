const crypto = require('crypto');
const razorpay = require('../utils/razorpay');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// @desc   Create Razorpay Order
// @route  POST /api/v1/payments/create-order
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt.toString(),
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      data: {
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(new AppError('Failed to create Razorpay order', 500));
  }
};

// @desc   Verify Razorpay Payment
// @route  POST /api/v1/payments/verify
const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Payment is successful
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid' },
        { new: true }
      );

      if (!updatedOrder) {
         return next(new AppError('Order not found', 404));
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: updatedOrder,
      });
    } else {
      // Payment verification failed
      next(new AppError('Payment verification failed. Signature mismatch.', 400));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
