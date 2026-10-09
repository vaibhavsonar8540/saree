const express = require('express');
const router = express.Router();
const {
  getShippingSettings,
  updateShippingSettings,
  checkPincode,
  upsertPincode,
} = require('../controllers/shippingController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/settings', getShippingSettings);
router.get('/check-pincode/:pincode', checkPincode);

// Admin endpoints
router.put('/settings', protect, checkRole('admin'), updateShippingSettings);
router.post('/pincode', protect, checkRole('admin'), upsertPincode);

module.exports = router;
