const express = require('express');
const router = express.Router();
const { getFoods, getFood, addFood, updateFood, deleteFood, getFoodsByRestaurant, getOwnerFoods } = require('../controllers/foodController');
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Public
router.get('/', getFoods);
router.get('/restaurant/:restaurantId', getFoodsByRestaurant);
router.get('/:id', getFood);

// Owner
router.get('/owner/my-foods', protect, authorize('owner'), getOwnerFoods);
router.post('/', protect, authorize('owner'), upload.array('images', 5), addFood);
router.patch('/:id', protect, authorize('owner', 'admin'), upload.array('images', 5), updateFood);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteFood);

module.exports = router;
