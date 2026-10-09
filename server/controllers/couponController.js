const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check DB first
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (coupon) {
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon code has expired' });
      }
      if (subtotal < coupon.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        });
      }
      return res.status(200).json({
        success: true,
        data: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
        },
      });
    }

    // Predefined coupon checks
    if (cleanCode === 'ANJALI10' || cleanCode === 'SAREE10') {
      return res.status(200).json({
        success: true,
        data: {
          code: cleanCode,
          discountType: 'percentage',
          discountValue: 10,
          minOrderValue: 0,
        },
      });
    }

    if (cleanCode === 'ANJALI20') {
      return res.status(200).json({
        success: true,
        data: {
          code: cleanCode,
          discountType: 'percentage',
          discountValue: 20,
          minOrderValue: 0,
        },
      });
    }

    res.status(404).json({
      success: false,
      message: 'Invalid coupon code',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message,
    });
  }
};

module.exports = {
  validateCoupon,
};
