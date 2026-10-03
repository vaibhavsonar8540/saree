const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrderById,
  getUserOrders,
  updatePaymentStatus,
} = require('../controllers/orderController');

/**
 * Middleware for optional authentication (attaches user to req if valid token exists)
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_key'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Token invalid or expired, continue as guest
    }
  }
  next();
};

// Routes
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', optionalAuth, getOrderById);
router.patch('/:id/payment', optionalAuth, updatePaymentStatus);

module.exports = router;
