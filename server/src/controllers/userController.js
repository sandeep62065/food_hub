const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');
const LoyaltySettings = require('../models/LoyaltySettings');
const AppError = require('../utils/AppError');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc   Get my profile
// @route  GET /api/v1/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc   Update my profile
// @route  PATCH /api/v1/users/me
const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // Handle avatar upload
    if (req.file) {
      try {
        const { url } = await uploadToCloudinary(req.file.buffer, 'foodiehub/avatars');
        updateData.avatarUrl = url;
      } catch {
        updateData.avatarUrl = req.user.avatarUrl;
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PATCH /api/v1/users/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all addresses
// @route  GET /api/v1/users/me/addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort('-isDefault -createdAt');
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

// @desc   Add address
// @route  POST /api/v1/users/me/addresses
const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({ user: req.user._id, label, street, city, state, pincode, isDefault: isDefault || false });
    res.status(201).json({ success: true, message: 'Address added', data: address });
  } catch (error) {
    next(error);
  }
};

// @desc   Update address
// @route  PATCH /api/v1/users/me/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return next(new AppError('Address not found', 404));

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();
    res.json({ success: true, message: 'Address updated', data: address });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete address
// @route  DELETE /api/v1/users/me/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return next(new AppError('Address not found', 404));
    res.json({ success: true, message: 'Address removed' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get loyalty points and settings
// @route  GET /api/v1/users/loyalty-points
const getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let settings = await LoyaltySettings.findOne();
    if (!settings) settings = await LoyaltySettings.create({});

    res.json({
      success: true,
      data: {
        points: user.loyaltyPoints,
        redeemRate: settings.redeemRate,
        minRedeemPoints: settings.minRedeemPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get referral info
// @route  GET /api/v1/users/referral
const getReferralInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const referredUsers = await User.find({ referredBy: req.user._id }).select('_id');
    const referredUserIds = referredUsers.map(u => u._id);
    
    // Count how many referred users have at least 1 delivered order
    const successfulReferrals = await Order.distinct('user', { 
      user: { $in: referredUserIds }, 
      orderStatus: 'delivered' 
    });

    const shareableLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        shareableLink,
        successfulReferralsCount: successfulReferrals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, changePassword, getAddresses, addAddress, updateAddress, deleteAddress, getLoyaltyPoints, getReferralInfo };
