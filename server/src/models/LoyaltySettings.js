const mongoose = require('mongoose');

const loyaltySettingsSchema = new mongoose.Schema(
  {
    pointsPerRupee: { type: Number, default: 0.1 }, // 1 point per 10 rupees
    redeemRate: { type: Number, default: 0.1 }, // 1 point = 0.1 rupees
    minRedeemPoints: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltySettings', loyaltySettingsSchema);
