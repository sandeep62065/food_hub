const LoyaltySettings = require('../models/LoyaltySettings');
const User = require('../models/User');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

// @desc   Get Loyalty Settings
// @route  GET /api/v1/admin/loyalty/settings
const getLoyaltySettings = async (req, res, next) => {
  try {
    let settings = await LoyaltySettings.findOne();
    if (!settings) {
      settings = await LoyaltySettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc   Update Loyalty Settings
// @route  PATCH /api/v1/admin/loyalty/settings
const updateLoyaltySettings = async (req, res, next) => {
  try {
    let settings = await LoyaltySettings.findOne();
    if (!settings) {
      settings = await LoyaltySettings.create({});
    }

    Object.assign(settings, req.body);
    await settings.save();
    
    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc   Get Loyalty Stats
// @route  GET /api/v1/admin/loyalty/stats
const getLoyaltyStats = async (req, res, next) => {
  try {
    const statsAgg = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalPointsIssued: { $sum: '$pointsEarned' },
          totalPointsRedeemed: { $sum: '$pointsRedeemed' }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: {
        totalPointsIssued: statsAgg[0]?.totalPointsIssued || 0,
        totalPointsRedeemed: statsAgg[0]?.totalPointsRedeemed || 0
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Adjust User Points
// @route  PATCH /api/v1/admin/loyalty/users/:id/adjust
const adjustUserPoints = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number') {
      return next(new AppError('Amount must be a number', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    user.loyaltyPoints += amount;
    if (user.loyaltyPoints < 0) user.loyaltyPoints = 0; // prevent negative points

    await user.save();
    res.json({ success: true, message: 'Points adjusted', data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLoyaltySettings, updateLoyaltySettings, getLoyaltyStats, adjustUserPoints };
