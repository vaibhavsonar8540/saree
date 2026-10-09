const Cart = require('../models/Cart');
const Saree = require('../models/Saree');
const { calculateCartTotals } = require('../utils/cartCalculator');

/**
 * Helper to find or create cart for authenticated user or guest token
 */
const getOrCreateCart = async (req) => {
  let cart = null;

  if (req.user && req.user._id) {
    cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      // If guest cart exists for this session, migrate it to user
      if (req.guestToken) {
        cart = await Cart.findOne({ guestToken: req.guestToken });
        if (cart) {
          cart.userId = req.user._id;
          cart.guestToken = null;
          await cart.save();
        }
      }
    }
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }
  } else if (req.guestToken) {
    cart = await Cart.findOne({ guestToken: req.guestToken });
    if (!cart) {
      cart = await Cart.create({ guestToken: req.guestToken, items: [] });
    }
  }

  return cart;
};

// @desc    Get current cart (user or guest)
// @route   GET /api/cart
// @access  Public (Guest/User)
const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    const { pincode } = req.query;

    const calculation = await calculateCartTotals({
      cartItems: cart ? cart.items : [],
      couponCode: cart ? cart.couponCode : '',
      pincode: pincode || '',
    });

    res.status(200).json({
      success: true,
      data: {
        cartId: cart ? cart._id : null,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Public (Guest/User)
const addToCart = async (req, res) => {
  try {
    const { productId, colorId, quantity = 1 } = req.body;
    // NOTE: Ignore any price, discount, or total sent in body! Backend is single source of truth.

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    const product = await Saree.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
    if (product.stock < qtyToAdd) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const cart = await getOrCreateCart(req);

    // Check if item combination already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (colorId
          ? item.colorId && item.colorId.toString() === colorId.toString()
          : !item.colorId)
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qtyToAdd;
      cart.items[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      cart.items.push({
        productId: product._id,
        colorId: colorId || null,
        quantity: Math.min(qtyToAdd, product.stock),
      });
    }

    await cart.save();

    const calculation = await calculateCartTotals({
      cartItems: cart.items,
      couponCode: cart.couponCode,
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cartId: cart._id,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Public (Guest/User)
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (quantity === undefined || isNaN(quantity) || isNaN(newQty)) {
      return res.status(400).json({
        success: false,
        message: 'Valid numeric quantity is required',
      });
    }

    const cart = await getOrCreateCart(req);

    const itemIndex = cart.items.findIndex(
      (item) => item._id && item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check available DB stock
      const product = await Saree.findById(cart.items[itemIndex].productId);
      const maxStock = product ? product.stock : newQty;
      cart.items[itemIndex].quantity = Math.min(newQty, maxStock);
    }

    await cart.save();

    const calculation = await calculateCartTotals({
      cartItems: cart.items,
      couponCode: cart.couponCode,
    });

    res.status(200).json({
      success: true,
      message: newQty <= 0 ? 'Item removed from cart' : 'Cart item quantity updated',
      data: {
        cartId: cart._id,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item',
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Public (Guest/User)
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req);

    cart.items = cart.items.filter(
      (item) => item._id && item._id.toString() !== itemId
    );
    await cart.save();

    const calculation = await calculateCartTotals({
      cartItems: cart.items,
      couponCode: cart.couponCode,
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cartId: cart._id,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart',
      error: error.message,
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Public (Guest/User)
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode || typeof couponCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const cart = await getOrCreateCart(req);
    cart.couponCode = couponCode.trim().toUpperCase();
    await cart.save();

    const calculation = await calculateCartTotals({
      cartItems: cart.items,
      couponCode: cart.couponCode,
    });

    if (!calculation.coupon.applied) {
      return res.status(400).json({
        success: false,
        message: calculation.coupon.message || 'Invalid coupon code',
        data: {
          cartId: cart._id,
          items: calculation.items,
          summary: calculation.summary,
          coupon: calculation.coupon,
          warnings: calculation.warnings,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: calculation.coupon.message,
      data: {
        cartId: cart._id,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    console.error('Error in applyCoupon:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying coupon',
      error: error.message,
    });
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Public (Guest/User)
const removeCoupon = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    cart.couponCode = '';
    await cart.save();

    const calculation = await calculateCartTotals({
      cartItems: cart.items,
      couponCode: '',
    });

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cartId: cart._id,
        items: calculation.items,
        summary: calculation.summary,
        coupon: calculation.coupon,
        warnings: calculation.warnings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing coupon',
      error: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Public (Guest/User)
const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req);
    cart.items = [];
    cart.couponCode = '';
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        cartId: cart._id,
        items: [],
        summary: {
          subtotal: 0,
          discount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          currency: 'INR',
        },
        coupon: { code: '', applied: false },
        warnings: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  clearCart,
};
