const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
} = require('../controllers/cartController');
const { guestOrUserAuth } = require('../middleware/guestAuthMiddleware');

// Apply guestOrUserAuth middleware to all cart endpoints
router.use(guestOrUserAuth);

router
  .route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

router
  .route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
