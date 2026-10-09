const Saree = require('../models/Saree');
const ShippingSettings = require('../models/ShippingSettings');
const Pincode = require('../models/Pincode');
const Coupon = require('../models/Coupon');

/**
 * Single Source of Truth function for all money and totals calculations.
 * Used by Cart API, Checkout API, and Order Creation.
 * 
 * @param {Object} options
 * @param {Array} options.cartItems - Raw cart item array [{ productId, colorId, quantity, price? }]
 * @param {String} options.couponCode - Optional coupon code
 * @param {String} options.pincode - Optional delivery pincode
 * @returns {Promise<Object>} Calculated cart totals & warnings
 */
const calculateCartTotals = async ({ cartItems = [], couponCode = '', pincode = '' }) => {
  const warnings = [];
  const processedItems = [];
  let subtotal = 0;

  // 1. Fetch current DB products & compute line totals
  for (const rawItem of cartItems) {
    if (!rawItem || !rawItem.productId) continue;

    const productIdStr =
      typeof rawItem.productId === 'object' && rawItem.productId._id
        ? rawItem.productId._id.toString()
        : rawItem.productId.toString();

    const product = await Saree.findById(productIdStr);

    if (!product || !product.isActive) {
      warnings.push({
        type: 'ITEM_UNAVAILABLE',
        productId: productIdStr,
        name: rawItem.name || product?.name || 'Product',
        message: `Product "${rawItem.name || product?.name || 'Item'}" is no longer available and was removed from calculations.`,
      });
      continue;
    }

    // Determine fresh unit price from DB
    const dbUnitPrice =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price;

    // Price change check warning
    if (rawItem.price && rawItem.price !== dbUnitPrice) {
      warnings.push({
        type: 'PRICE_CHANGED',
        productId: productIdStr,
        name: product.name,
        oldPrice: rawItem.price,
        newPrice: dbUnitPrice,
        message: `Price for "${product.name}" updated from ₹${rawItem.price} to ₹${dbUnitPrice}.`,
      });
    }

    // Stock check
    let validQty = Math.max(1, parseInt(rawItem.quantity || 1, 10));
    if (product.stock <= 0) {
      warnings.push({
        type: 'OUT_OF_STOCK',
        productId: productIdStr,
        name: product.name,
        message: `"${product.name}" is currently out of stock.`,
      });
      continue; // Skip out-of-stock items
    } else if (validQty > product.stock) {
      warnings.push({
        type: 'QTY_REDUCED',
        productId: productIdStr,
        name: product.name,
        requestedQty: validQty,
        availableStock: product.stock,
        message: `Quantity for "${product.name}" reduced from ${validQty} to available stock (${product.stock}).`,
      });
      validQty = product.stock;
    }

    const lineTotal = dbUnitPrice * validQty;
    subtotal += lineTotal;

    // Resolve color variant details
    let colorDetail = null;
    let selectedColorMedia = null;

    if (rawItem.colorId) {
      const colorIdStr = typeof rawItem.colorId === 'object' ? rawItem.colorId._id?.toString() : rawItem.colorId.toString();
      if (Array.isArray(product.colors)) {
        const foundColor = product.colors.find((c) => c._id.toString() === colorIdStr);
        if (foundColor) {
          colorDetail = {
            _id: foundColor._id,
            name: foundColor.name,
            hexCode: foundColor.hexCode,
          };
        }
      }
      if (Array.isArray(product.colorMedia)) {
        selectedColorMedia = product.colorMedia.find(
          (m) => m.colorId && m.colorId.toString() === colorIdStr
        );
      }
    }

    processedItems.push({
      _id: rawItem._id || null,
      productId: product._id,
      name: product.name,
      SKU: product.SKU,
      fabric: product.fabric || '',
      price: product.price,
      discountedPrice: product.discountedPrice || 0,
      unitPrice: dbUnitPrice,
      quantity: validQty,
      lineTotal,
      thumbnail: selectedColorMedia?.thumbnail || product.thumbnail || '',
      color: colorDetail,
      stock: product.stock,
    });
  }

  // 2. Fetch admin shipping settings & calculate shipping fee
  const shippingSettings = await ShippingSettings.getSettings();
  let shippingCharge = 0;
  let pincodeInfo = null;
  let pincodeServiceable = true;

  if (pincode && pincode.trim().length === 6) {
    const foundPincode = await Pincode.findOne({ pincode: pincode.trim() });
    if (foundPincode) {
      pincodeInfo = {
        pincode: foundPincode.pincode,
        city: foundPincode.city,
        state: foundPincode.state,
        isServiceable: foundPincode.isServiceable,
        estimatedDeliveryDays: foundPincode.estimatedDeliveryDays,
        codAvailable: foundPincode.codAvailable,
      };
      pincodeServiceable = foundPincode.isServiceable;
    }
  }

  // Rule: If order subtotal is below minFreeShippingThreshold (default 999) => flatShippingRate (default 199).
  // If order subtotal is >= minFreeShippingThreshold => free (0).
  if (processedItems.length === 0 || subtotal === 0) {
    shippingCharge = 0;
  } else if (subtotal >= shippingSettings.minFreeShippingThreshold) {
    shippingCharge = 0;
  } else {
    shippingCharge = shippingSettings.flatShippingRate;
  }

  // 3. Calculate coupon discount
  let discountAmount = 0;
  let couponInfo = {
    code: '',
    applied: false,
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
    message: '',
  };

  const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : '';

  if (cleanCoupon && processedItems.length > 0 && subtotal > 0) {
    // Check DB Coupon model first
    const dbCoupon = await Coupon.findOne({ code: cleanCoupon, isActive: true });

    if (dbCoupon) {
      const now = new Date();
      if (dbCoupon.expiryDate && new Date(dbCoupon.expiryDate) < now) {
        couponInfo.message = 'Coupon code has expired';
      } else if (subtotal < dbCoupon.minOrderValue) {
        couponInfo.message = `Minimum order amount of ₹${dbCoupon.minOrderValue} required for this coupon`;
      } else if (dbCoupon.usageLimit && dbCoupon.usedCount >= dbCoupon.usageLimit) {
        couponInfo.message = 'Coupon usage limit reached';
      } else {
        if (dbCoupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * dbCoupon.discountValue) / 100);
          if (dbCoupon.maxDiscountAmount && discountAmount > dbCoupon.maxDiscountAmount) {
            discountAmount = dbCoupon.maxDiscountAmount;
          }
        } else {
          discountAmount = dbCoupon.discountValue;
        }
        couponInfo = {
          code: dbCoupon.code,
          applied: true,
          discountType: dbCoupon.discountType,
          discountValue: dbCoupon.discountValue,
          discountAmount,
          message: `${dbCoupon.discountValue}% promo code applied successfully!`,
        };
      }
    } else {
      // Fallback predefined promo codes (ANJALI10, SAREE10, ANJALI20)
      if (cleanCoupon === 'ANJALI10' || cleanCoupon === 'SAREE10') {
        discountAmount = Math.round((subtotal * 10) / 100);
        couponInfo = {
          code: cleanCoupon,
          applied: true,
          discountType: 'percentage',
          discountValue: 10,
          discountAmount,
          message: '10% discount applied successfully!',
        };
      } else if (cleanCoupon === 'ANJALI20') {
        discountAmount = Math.round((subtotal * 20) / 100);
        couponInfo = {
          code: cleanCoupon,
          applied: true,
          discountType: 'percentage',
          discountValue: 20,
          discountAmount,
          message: '20% discount applied successfully!',
        };
      } else {
        couponInfo.message = 'Invalid coupon code';
      }
    }
  }

  // Discount can never exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  couponInfo.discountAmount = discountAmount;

  // 4. Calculate Tax & Total
  // Tax is 0 per user instruction ("dont implement gst charges")
  const tax = 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCharge + tax);

  const minForFreeShippingRemaining = Math.max(
    0,
    shippingSettings.minFreeShippingThreshold - subtotal
  );

  return {
    items: processedItems,
    summary: {
      subtotal,
      discount: discountAmount,
      shipping: shippingCharge,
      tax,
      total: grandTotal,
      currency: 'INR',
      freeShippingThreshold: shippingSettings.minFreeShippingThreshold,
      flatShippingRate: shippingSettings.flatShippingRate,
      minForFreeShippingRemaining,
      isFreeShipping: shippingCharge === 0 && subtotal > 0,
    },
    coupon: couponInfo,
    pincodeInfo: pincodeInfo || {
      pincode: pincode || '',
      isServiceable: pincodeServiceable,
    },
    warnings,
  };
};

module.exports = {
  calculateCartTotals,
};
