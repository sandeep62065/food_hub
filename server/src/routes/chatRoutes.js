const express = require('express');
const router = express.Router();
const { getMessagesForOrder } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/:orderId/messages', getMessagesForOrder);

module.exports = router;
