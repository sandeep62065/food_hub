const Cart = require('../models/Cart');
const Food = require('../models/Food');
const AppError = require('../utils/AppError');

// Helper: populate cart fully
const populatedCart = (cartQuery) =>
  cartQuery
    .populate('items.food', 'name images price discountPrice isAvailable isVeg')
    .populate('restaurant', 'name coverImage deliveryFee minOrderAmount estimatedDeliveryTime');

// @desc   Get my cart
// @route  GET /api/v1/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await populatedCart(Cart.findOne({ user: req.user._id }));
    if (!cart) {
      cart = { user: req.user._id, items: [], restaurant: null, subtotal: 0, totalItems: 0 };
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc   Add item to cart
// @route  POST /api/v1/cart
const addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    const food = await Food.findById(foodId).populate('restaurant');
    if (!food) return next(new AppError('Food item not found', 404));
    if (!food.isAvailable) return next(new AppError('This item is currently unavailable', 400));

    const effectivePrice = food.discountPrice && food.discountPrice < food.price ? food.discountPrice : food.price;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, restaurant: food.restaurant._id, items: [] });
    }

    // Enforce single restaurant per cart
    if (cart.restaurant && cart.restaurant.toString() !== food.restaurant._id.toString()) {
      return res.status(409).json({
        success: false,
        message: 'Your cart has items from another restaurant. Clear cart to add items from this restaurant.',
        conflict: true,
        currentRestaurant: cart.restaurant,
      });
    }

    cart.restaurant = food.restaurant._id;

    const existingItem = cart.items.find((item) => item.food.toString() === foodId);
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      cart.items.push({ food: foodId, quantity: parseInt(quantity), price: effectivePrice });
    }

    await cart.save();
    const updatedCart = await populatedCart(Cart.findById(cart._id));
    res.json({ success: true, message: 'Item added to cart', data: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc   Update item quantity
// @route  PATCH /api/v1/cart/:itemId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const item = cart.items.id(req.params.itemId);
    if (!item) return next(new AppError('Item not found in cart', 404));

    if (parseInt(quantity) <= 0) {
      item.deleteOne();
      if (cart.items.length === 0) cart.restaurant = undefined;
    } else {
      item.quantity = parseInt(quantity);
    }

    await cart.save();
    const updatedCart = await populatedCart(Cart.findById(cart._id));
    res.json({ success: true, message: 'Cart updated', data: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc   Remove item from cart
// @route  DELETE /api/v1/cart/:itemId
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const item = cart.items.id(req.params.itemId);
    if (!item) return next(new AppError('Item not found in cart', 404));

    item.deleteOne();
    if (cart.items.length === 0) cart.restaurant = undefined;

    await cart.save();
    const updatedCart = await populatedCart(Cart.findById(cart._id));
    res.json({ success: true, message: 'Item removed', data: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc   Clear cart
// @route  DELETE /api/v1/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], restaurant: undefined },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
