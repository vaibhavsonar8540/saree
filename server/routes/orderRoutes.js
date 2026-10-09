const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { guestOrUserAuth } = require('../middleware/guestAuthMiddleware');
const {
  validateCheckout,
  createOrder,
  getOrderById,
  getUserOrders,
} = require('../controllers/orderController');

// Routes
router.post('/validate-checkout', guestOrUserAuth, validateCheckout);
router.post('/', guestOrUserAuth, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', guestOrUserAuth, getOrderById);

module.exports = router;
