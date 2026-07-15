require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Category = require('../models/Category');

const FOOD_IMAGES = {
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  pasta: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400',
  sushi: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?w=400',
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  sandwich: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
};

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828329?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', // Awadhi vibe
  'https://images.unsplash.com/photo-1590846406792-0adc7f928a18?w=800', // Mughlai vibe
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Food.deleteMany({}),
      Category.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@foodiehub.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      phone: '9999999999',
    });

    const ownerUser = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@foodiehub.com',
      password: 'Owner@123',
      role: 'owner',
      isVerified: true,
      phone: '8888888888',
    });

    const ownerUser2 = await User.create({
      name: 'Second Owner',
      email: 'owner2@foodiehub.com',
      password: 'Owner@123',
      role: 'owner',
      isVerified: true,
      phone: '7777777777',
    });

    const customerUser = await User.create({
      name: 'John Customer',
      email: 'customer@foodiehub.com',
      password: 'Customer@123',
      role: 'customer',
      isVerified: true,
      phone: '6666666666',
    });

    console.log('👤 Users created');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Pizza', slug: 'pizza', image: FOOD_IMAGES.pizza },
      { name: 'Burgers', slug: 'burgers', image: FOOD_IMAGES.burger },
      { name: 'Biryani', slug: 'biryani', image: FOOD_IMAGES.biryani },
      { name: 'Pasta', slug: 'pasta', image: FOOD_IMAGES.pasta },
      { name: 'Sushi', slug: 'sushi', image: FOOD_IMAGES.sushi },
      { name: 'Salads', slug: 'salads', image: FOOD_IMAGES.salad },
      { name: 'Sandwiches', slug: 'sandwiches', image: FOOD_IMAGES.sandwich },
      { name: 'Desserts', slug: 'desserts', image: FOOD_IMAGES.dessert },
    ]);
    console.log('📁 Categories created');

    const catMap = {};
    categories.forEach((c) => { catMap[c.slug] = c._id; });

    // Create restaurants
    const restaurants = await Restaurant.insertMany([
      {
        owner: ownerUser._id,
        name: "Mario's Pizzeria",
        description: 'Authentic Italian pizza with fresh ingredients and wood-fired ovens.',
        coverImage: RESTAURANT_IMAGES[0],
        cuisine: ['Italian', 'Pizza'],
        address: { street: '123 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', lat: 12.9716, lng: 77.5946 },
        openingHours: { open: '10:00', close: '23:00' },
        avgRating: 4.5,
        totalReviews: 128,
        isApproved: true,
        isOpen: true,
        deliveryFee: 30,
        estimatedDeliveryTime: '25-35 mins',
      },
      {
        owner: ownerUser._id,
        name: 'Burger Bliss',
        description: 'Gourmet burgers crafted with premium ingredients. Juicy, crispy, unforgettable.',
        coverImage: RESTAURANT_IMAGES[1],
        cuisine: ['American', 'Burgers', 'Fast Food'],
        address: { street: '456 Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', lat: 12.9352, lng: 77.6245 },
        openingHours: { open: '11:00', close: '23:30' },
        avgRating: 4.3,
        totalReviews: 96,
        isApproved: true,
        isOpen: true,
        deliveryFee: 25,
        estimatedDeliveryTime: '20-30 mins',
      },
      {
        owner: ownerUser2._id,
        name: 'Biryani House',
        description: 'Authentic Hyderabadi dum biryani with secret spice blends passed down for generations.',
        coverImage: RESTAURANT_IMAGES[2],
        cuisine: ['Indian', 'Biryani', 'Mughlai'],
        address: { street: '789 Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038', lat: 12.9784, lng: 77.6408 },
        openingHours: { open: '11:30', close: '22:30' },
        avgRating: 4.7,
        totalReviews: 245,
        isApproved: true,
        isOpen: true,
        deliveryFee: 20,
        estimatedDeliveryTime: '30-45 mins',
      },
      {
        owner: ownerUser2._id,
        name: 'Sushi Sakura',
        description: 'Premium Japanese sushi and sashimi crafted by master chefs. Fresh fish daily.',
        coverImage: RESTAURANT_IMAGES[3],
        cuisine: ['Japanese', 'Sushi', 'Asian'],
        address: { street: '101 Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066', lat: 12.9698, lng: 77.7499 },
        openingHours: { open: '12:00', close: '22:00' },
        avgRating: 4.6,
        totalReviews: 78,
        isApproved: true,
        isOpen: true,
        deliveryFee: 50,
        estimatedDeliveryTime: '35-50 mins',
      },
      // LUCKNOW RESTAURANTS
      {
        owner: ownerUser._id,
        name: 'Tunday Kababi',
        description: 'The legendary Awadhi cuisine destination, world famous for its melt-in-the-mouth Galouti Kebabs and authentic Mughlai delicacies.',
        coverImage: RESTAURANT_IMAGES[4],
        cuisine: ['Awadhi', 'Mughlai', 'Indian'],
        address: { street: 'Naaz Cinema Road, Aminabad', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226018', lat: 26.8406, lng: 80.9231 },
        openingHours: { open: '12:30', close: '23:30' },
        avgRating: 4.9,
        totalReviews: 5000,
        isApproved: true,
        isOpen: true,
        deliveryFee: 40,
        estimatedDeliveryTime: '40-55 mins',
      },
      {
        owner: ownerUser2._id,
        name: 'Dastarkhwan',
        description: 'A traditional royal feast experience serving the finest Chicken Masala, Biryani, and traditional breads in the heart of Lucknow.',
        coverImage: RESTAURANT_IMAGES[5],
        cuisine: ['Mughlai', 'North Indian', 'Biryani'],
        address: { street: 'Tulsi Theatre Building, Lalbagh', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', lat: 26.8467, lng: 80.9462 },
        openingHours: { open: '13:00', close: '23:00' },
        avgRating: 4.7,
        totalReviews: 3200,
        isApproved: true,
        isOpen: true,
        deliveryFee: 35,
        estimatedDeliveryTime: '35-50 mins',
      },
    ]);
    console.log('🏪 Restaurants created');

    // Create foods
    await Food.insertMany([
      // Mario's Pizzeria foods
      { restaurant: restaurants[0]._id, name: 'Margherita Pizza', description: 'Classic tomato sauce with fresh mozzarella and basil leaves on a crispy thin crust.', images: [FOOD_IMAGES.pizza], category: catMap['pizza'], price: 299, discountPrice: 249, isVeg: true, ingredients: ['Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil'], avgRating: 4.5 },
      { restaurant: restaurants[0]._id, name: 'Pepperoni Blast', description: 'Loaded with premium pepperoni slices and three cheese blend for the ultimate pizza experience.', images: [FOOD_IMAGES.pizza], category: catMap['pizza'], price: 399, discountPrice: 349, isVeg: false, ingredients: ['Pepperoni', 'Mozzarella', 'Cheddar', 'Parmesan'], avgRating: 4.7 },
      { restaurant: restaurants[0]._id, name: 'Penne Arrabiata', description: 'Spicy Italian pasta in a zesty tomato sauce with fresh garlic and red chili flakes.', images: [FOOD_IMAGES.pasta], category: catMap['pasta'], price: 249, isVeg: true, ingredients: ['Penne', 'Tomato', 'Garlic', 'Red Chili', 'Parmesan'], avgRating: 4.2 },
      { restaurant: restaurants[0]._id, name: 'Tiramisu', description: 'Classic Italian dessert with layers of mascarpone, coffee-soaked ladyfingers, and cocoa powder.', images: [FOOD_IMAGES.dessert], category: catMap['desserts'], price: 199, isVeg: true, ingredients: ['Mascarpone', 'Ladyfingers', 'Coffee', 'Cocoa'], avgRating: 4.8 },

      // Burger Bliss foods
      { restaurant: restaurants[1]._id, name: 'Classic Smash Burger', description: 'Double smashed beef patties with special sauce, pickles, and American cheese on a brioche bun.', images: [FOOD_IMAGES.burger], category: catMap['burgers'], price: 249, discountPrice: 199, isVeg: false, ingredients: ['Beef Patty', 'American Cheese', 'Special Sauce', 'Pickles', 'Brioche Bun'], avgRating: 4.6 },
      { restaurant: restaurants[1]._id, name: 'Veggie Supreme Burger', description: 'Crispy plant-based patty with avocado, fresh vegetables, and house-made mayo.', images: [FOOD_IMAGES.burger], category: catMap['burgers'], price: 219, isVeg: true, ingredients: ['Plant Patty', 'Avocado', 'Lettuce', 'Tomato', 'Vegan Mayo'], avgRating: 4.3 },
      { restaurant: restaurants[1]._id, name: 'BBQ Chicken Sandwich', description: 'Crispy fried chicken with smoky BBQ sauce, coleslaw, and pickled jalapeños.', images: [FOOD_IMAGES.sandwich], category: catMap['sandwiches'], price: 229, isVeg: false, ingredients: ['Fried Chicken', 'BBQ Sauce', 'Coleslaw', 'Jalapeños'], avgRating: 4.4 },
      { restaurant: restaurants[1]._id, name: 'Caesar Salad', description: 'Crisp romaine lettuce, parmesan shavings, croutons in classic Caesar dressing.', images: [FOOD_IMAGES.salad], category: catMap['salads'], price: 179, isVeg: true, ingredients: ['Romaine', 'Parmesan', 'Croutons', 'Caesar Dressing'], avgRating: 4.1 },

      // Biryani House foods
      { restaurant: restaurants[2]._id, name: 'Hyderabadi Dum Biryani', description: 'Aromatic basmati rice cooked with tender mutton, saffron, and secret spices in traditional dum style.', images: [FOOD_IMAGES.biryani], category: catMap['biryani'], price: 349, discountPrice: 299, isVeg: false, ingredients: ['Basmati Rice', 'Mutton', 'Saffron', 'Fried Onions', 'Mint', 'Ghee'], avgRating: 4.8 },
      { restaurant: restaurants[2]._id, name: 'Veg Biryani', description: 'Fragrant basmati rice with seasonal vegetables, paneer, and aromatic whole spices.', images: [FOOD_IMAGES.biryani], category: catMap['biryani'], price: 249, isVeg: true, ingredients: ['Basmati Rice', 'Vegetables', 'Paneer', 'Whole Spices'], avgRating: 4.5 },
      { restaurant: restaurants[2]._id, name: 'Chicken Biryani', description: 'Juicy chicken pieces marinated in yogurt and spices, cooked with fragrant basmati rice.', images: [FOOD_IMAGES.biryani], category: catMap['biryani'], price: 299, discountPrice: 279, isVeg: false, ingredients: ['Chicken', 'Basmati Rice', 'Yogurt Marinade', 'Saffron'], avgRating: 4.7 },
      { restaurant: restaurants[2]._id, name: 'Gulab Jamun', description: 'Soft milk-solid balls soaked in rose-flavored sugar syrup. Served warm.', images: [FOOD_IMAGES.dessert], category: catMap['desserts'], price: 99, isVeg: true, ingredients: ['Khoya', 'Rose Syrup', 'Cardamom'], avgRating: 4.6 },

      // Sushi Sakura foods
      { restaurant: restaurants[3]._id, name: 'Salmon Nigiri (8 pcs)', description: 'Fresh Atlantic salmon over hand-pressed sushi rice with a touch of wasabi.', images: [FOOD_IMAGES.sushi], category: catMap['sushi'], price: 499, isVeg: false, ingredients: ['Fresh Salmon', 'Sushi Rice', 'Wasabi', 'Soy Sauce'], avgRating: 4.8 },
      { restaurant: restaurants[3]._id, name: 'Dragon Roll', description: 'Shrimp tempura topped with avocado, tobiko, and spicy mayo. A showstopper.', images: [FOOD_IMAGES.sushi], category: catMap['sushi'], price: 599, discountPrice: 549, isVeg: false, ingredients: ['Shrimp Tempura', 'Avocado', 'Tobiko', 'Spicy Mayo'], avgRating: 4.9 },
      { restaurant: restaurants[3]._id, name: 'Veggie Maki Roll', description: 'Cucumber, avocado, and pickled radish wrapped in nori and seasoned rice.', images: [FOOD_IMAGES.sushi], category: catMap['sushi'], price: 349, isVeg: true, ingredients: ['Cucumber', 'Avocado', 'Pickled Radish', 'Nori', 'Sushi Rice'], avgRating: 4.4 },
      { restaurant: restaurants[3]._id, name: 'Miso Soup', description: 'Traditional Japanese miso soup with tofu, wakame seaweed, and spring onions.', images: [FOOD_IMAGES.salad], category: catMap['salads'], price: 149, isVeg: true, ingredients: ['Miso Paste', 'Tofu', 'Wakame', 'Spring Onions'], avgRating: 4.3 },

      // LUCKNOW: Tunday Kababi foods
      { restaurant: restaurants[4]._id, name: 'Galouti Kebab', description: 'The famous melt-in-your-mouth minced mutton kebabs prepared with a 160-spice secret recipe.', images: [FOOD_IMAGES.burger], category: catMap['burgers'], price: 320, discountPrice: 299, isVeg: false, ingredients: ['Mincemeat', 'Raw Papaya', 'Secret Awadhi Spices', 'Ghee'], avgRating: 4.9 },
      { restaurant: restaurants[4]._id, name: 'Awadhi Mutton Biryani', description: 'Traditional Lucknowi style biryani cooked with subtle spices, kewra water, and tender mutton chunks.', images: [FOOD_IMAGES.biryani], category: catMap['biryani'], price: 380, isVeg: false, ingredients: ['Basmati Rice', 'Mutton', 'Kewra Water', 'Saffron', 'Mild Spices'], avgRating: 4.8 },
      { restaurant: restaurants[4]._id, name: 'Ulte Tawa ka Paratha', description: 'Sweet and soft saffron-infused flatbread traditionally eaten with Galouti Kebabs.', images: [FOOD_IMAGES.sandwich], category: catMap['sandwiches'], price: 60, isVeg: true, ingredients: ['Flour', 'Milk', 'Saffron', 'Ghee'], avgRating: 4.7 },
      { restaurant: restaurants[4]._id, name: 'Shahi Tukda', description: 'Rich bread pudding dessert of fried bread slices soaked in hot milk with spices, including saffron and cardamom.', images: [FOOD_IMAGES.dessert], category: catMap['desserts'], price: 150, isVeg: true, ingredients: ['Bread', 'Rabri', 'Saffron', 'Cardamom', 'Nuts'], avgRating: 4.8 },

      // LUCKNOW: Dastarkhwan foods
      { restaurant: restaurants[5]._id, name: 'Chicken Masala', description: 'Dastarkhwan\'s signature spicy chicken curry cooked in a rich tomato-onion gravy.', images: [FOOD_IMAGES.pasta], category: catMap['pasta'], price: 350, discountPrice: 320, isVeg: false, ingredients: ['Chicken', 'Tomatoes', 'Onions', 'Garam Masala', 'Fresh Cream'], avgRating: 4.7 },
      { restaurant: restaurants[5]._id, name: 'Chicken Biryani', description: 'Flavorful and aromatic long-grain basmati rice mixed with succulent spicy chicken pieces.', images: [FOOD_IMAGES.biryani], category: catMap['biryani'], price: 300, isVeg: false, ingredients: ['Basmati Rice', 'Chicken', 'Yogurt', 'Awadhi Spices', 'Mint'], avgRating: 4.6 },
      { restaurant: restaurants[5]._id, name: 'Mutton Rogan Josh', description: 'A robust and spicy lamb curry that has its origins in Persian cuisine, brought to Lucknow by the Mughals.', images: [FOOD_IMAGES.pasta], category: catMap['pasta'], price: 420, isVeg: false, ingredients: ['Mutton', 'Kashmiri Chilies', 'Fennel', 'Ginger Powder'], avgRating: 4.8 },
      { restaurant: restaurants[5]._id, name: 'Roomali Roti', description: 'Extremely thin, soft, and large flatbread that resembles a handkerchief. Perfect for curries.', images: [FOOD_IMAGES.sandwich], category: catMap['sandwiches'], price: 25, isVeg: true, ingredients: ['Whole Wheat Flour', 'All-purpose Flour', 'Milk', 'Oil'], avgRating: 4.5 },

    ]);
    console.log('🍔 Foods created');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Test Accounts:');
    console.log('  Admin:    admin@foodiehub.com    / Admin@123');
    console.log('  Owner:    owner@foodiehub.com    / Owner@123');
    console.log('  Customer: customer@foodiehub.com / Customer@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
