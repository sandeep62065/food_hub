const express = require('express');
const router = express.Router();
const { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, getMyRestaurant } = require('../controllers/restaurantController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public
router.get('/', getRestaurants);
router.get('/mine', protect, authorize('owner'), getMyRestaurant);
router.get('/:id', getRestaurant);

// Owner
router.post('/', protect, authorize('owner'), upload.single('coverImage'), createRestaurant);
router.patch('/:id', protect, authorize('owner', 'admin'), upload.single('coverImage'), updateRestaurant);

module.exports = router;
