const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Saree = require('../models/Saree');
const { calculateCartTotals } = require('../utils/cartCalculator');
const { transitionOrder } = require('../utils/orderLifecycle');

/**
 * @desc    Validate checkout details & return server-calculated order summary
 * @route   POST /api/orders/validate-checkout
 * @access  Public (Guest / User)
 */
const validateCheckout = async (req, res) => {
  try {
    const { shippingAddress, items = [], couponCode = '' } = req.body;

    let rawItems = items;
    let activeCoupon = couponCode;

    if (!rawItems || rawItems.length === 0) {
      let cart = null;
      if (req.user && req.user._id) {
        cart = await Cart.findOne({ userId: req.user._id });
      } else if (req.guestToken) {
        cart = await Cart.findOne({ guestToken: req.guestToken });
      }
      if (cart) {
        rawItems = cart.items;
        if (!activeCoupon) activeCoupon = cart.couponCode;
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before checking out.',
      });
    }

    const pincode = shippingAddress?.pincode || '';
    const calculation = await calculateCartTotals({
      cartItems: rawItems,
      couponCode: activeCoupon,
      pincode,
    });

    if (pincode && pincode.length === 6 && !calculation.pincodeInfo.isServiceable) {
      return res.status(400).json({
        success: false,
        message: `Delivery is currently not available to pincode ${pincode}`,
        calculation,
      });
    }

    res.status(200).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error('Error in validateCheckout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate checkout details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new pending order with stock reservation
 * @route   POST /api/orders
 * @access  Public (Guest / User with token/guest cookie)
 */
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, items = [], couponCode = '', idempotencyKey: bodyIdempotencyKey } = req.body;

    const idempotencyKey =
      req.headers['x-idempotency-key'] ||
      bodyIdempotencyKey ||
      null;

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        console.log(`[Order API] Returned existing order for idempotency key: ${idempotencyKey}`);
        return res.status(200).json({
          success: true,
          message: 'Order already created (idempotent submission)',
          data: existingOrder,
        });
      }
    }

    // 1. Strict Server Field Validation
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address details are required',
      });
    }

    const {
      fullName,
      email,
      phone,
      country = 'India',
      state,
      city,
      addressLine,
      roadArea = '',
      pincode,
    } = shippingAddress;

    if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be between 2 and 80 characters',
      });
    }

    const cleanPhone = phone ? phone.toString().replace(/[\s\-\+\(\)]/g, '').slice(-10) : '';
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian phone number starting with 6-9',
      });
    }

    if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (!addressLine || addressLine.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Address Line 1 is required',
      });
    }

    const cleanPincode = pincode ? pincode.toString().trim() : '';
    if (!cleanPincode || !/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be 6 digits and cannot start with 0',
      });
    }

    // 2. Fetch User/Guest Cart & Items
    let cart = null;
    let targetItems = items;
    let activeCoupon = couponCode;

    if (req.user && req.user._id) {
      cart = await Cart.findOne({ userId: req.user._id });
    } else if (req.guestToken) {
      cart = await Cart.findOne({ guestToken: req.guestToken });
    }

    if (cart && cart.items && cart.items.length > 0) {
      targetItems = cart.items;
      if (!activeCoupon) activeCoupon = cart.couponCode;
    }

    if (!targetItems || targetItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order with an empty cart',
      });
    }

    // 3. Re-calculate ALL totals on the backend via calculateCartTotals
    const calculation = await calculateCartTotals({
      cartItems: targetItems,
      couponCode: activeCoupon,
      pincode: cleanPincode,
    });

    if (calculation.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'None of the items in your cart are currently available to purchase',
      });
    }

    if (calculation.pincodeInfo.isServiceable === false) {
      return res.status(400).json({
        success: false,
        message: `We do not deliver to pincode ${cleanPincode} yet`,
      });
    }

    // 4. Construct Order Document (Pending state with 15-min stock reservation)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user._id : null;
    const stockReservedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes stock lock

    const formattedOrderItems = calculation.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      fabric: item.fabric || '',
      colorName: item.color?.name || '',
      colorHex: item.color?.hexCode || '',
      image: item.thumbnail || '',
      quantity: item.quantity,
      price: item.unitPrice,
      itemSubtotal: item.lineTotal,
    }));

    const newOrder = new Order({
      orderNumber,
      userId,
      items: formattedOrderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        country: country || 'India',
        state: state || calculation.pincodeInfo.state || 'State',
        city: city || calculation.pincodeInfo.city || 'City',
        addressLine: addressLine.trim(),
        roadArea: roadArea ? roadArea.trim() : '',
        pincode: cleanPincode,
      },
      orderSummary: {
        subtotal: calculation.summary.subtotal,
        discount: calculation.summary.discount,
        deliveryCharge: calculation.summary.shipping,
        totalAmount: calculation.summary.total,
        couponCode: calculation.coupon.code || '',
      },
      paymentDetails: {
        paymentMethod: req.body.paymentMethod || 'Razorpay',
        paymentStatus: 'unpaid',
      },
      orderStatus: 'pending',
      currency: 'INR',
      stock_reserved_until: stockReservedUntil,
      idempotencyKey: idempotencyKey || null,
      statusHistory: [
        {
          orderStatus: 'pending',
          paymentStatus: 'unpaid',
          timestamp: new Date(),
          source: 'user',
          reason: 'Initial order created in pending state with 15-min stock reservation',
        },
      ],
    });

    // Save initial order
    const savedOrder = await newOrder.save();

    // Reserve stock atomically ($inc: -quantity)
    for (const orderItem of formattedOrderItems) {
      await Saree.updateOne(
        { _id: orderItem.productId, stock: { $gte: orderItem.quantity } },
        { $inc: { stock: -orderItem.quantity, salesCount: orderItem.quantity } }
      );
    }

    console.log(`[Order API] Created pending order ${orderNumber} for user: ${userId || 'Guest'}. Reserved stock until ${stockReservedUntil.toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Order created in pending state',
      data: savedOrder,
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get order by ID or orderNumber
 * @route   GET /api/orders/:id
 * @access  Public / User
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order = await Order.findById(id).populate('userId', 'name email phone');
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).populate('userId', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Security check: restrict user to reading only their own order if logged in
    if (req.user && order.userId && order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Auth User)
 */
const getUserOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user orders',
      error: error.message,
    });
  }
};

module.exports = {
  validateCheckout,
  createOrder,
  getOrderById,
  getUserOrders,
};
