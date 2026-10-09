const express = require('express');
const router = express.Router();
const { guestOrUserAuth } = require('../middleware/guestAuthMiddleware');
const { paymentRateLimiter } = require('../middleware/rateLimiter');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  cancelOrderAndRefund,
} = require('../controllers/paymentController');

// Public Webhook route (authenticated by HMAC Signature internally)
router.post('/webhook', handleWebhook);

// Authenticated / Session protected routes with Rate Limiting
router.post('/create-order', guestOrUserAuth, paymentRateLimiter, createPaymentOrder);
router.post('/verify', guestOrUserAuth, paymentRateLimiter, verifyPayment);
router.get('/status/:orderId', guestOrUserAuth, getPaymentStatus);
router.post('/cancel/:orderId', guestOrUserAuth, cancelOrderAndRefund);

module.exports = router;
