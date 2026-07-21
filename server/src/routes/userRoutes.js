const express = require('express');
const router = express.Router();
const { getMe, updateMe, changePassword, getAddresses, addAddress, updateAddress, deleteAddress, getLoyaltyPoints, getReferralInfo } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router.get('/me', getMe);
router.get('/loyalty-points', getLoyaltyPoints);
router.get('/referral', getReferralInfo);
router.patch('/me', upload.single('avatar'), updateMe);
router.patch('/me/password', changePassword);

router.route('/me/addresses').get(getAddresses).post(addAddress);
router.route('/me/addresses/:id').patch(updateAddress).delete(deleteAddress);

module.exports = router;
