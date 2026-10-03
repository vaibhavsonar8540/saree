const Order = require('../models/Order');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Public / Optional Auth (Attaches userId if user is logged in)
 */
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, items, couponCode, paymentMethod } = req.body;

    // 1. Validation: check items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order with an empty items list',
      });
    }

    // 2. Validation: check shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
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
      roadArea,
      pincode,
    } = shippingAddress;

    if (!fullName || !email || !phone || !state || !city || !addressLine || !roadArea || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required shipping address fields',
      });
    }

    // 3. Calculate order subtotal and validate items
    let calculatedSubtotal = 0;
    const formattedItems = items.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const itemSubtotal = price * quantity;
      calculatedSubtotal += itemSubtotal;

      return {
        productId: item.productId || item._id,
        name: item.name || 'Saree Product',
        fabric: item.fabric || '',
        colorName: item.colorName || '',
        colorHex: item.colorHex || '',
        image: item.image || item.thumbnail || '',
        quantity,
        price,
        itemSubtotal,
      };
    });

    // 4. Calculate coupon discount
    let discountPercent = 0;
    const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : '';
    if (cleanCoupon === 'ANJALI10' || cleanCoupon === 'SAREE10') {
      discountPercent = 10;
    } else if (cleanCoupon === 'ANJALI20') {
      discountPercent = 20;
    }

    const discountAmount = Math.round((calculatedSubtotal * discountPercent) / 100);
    const discountedSubtotal = Math.max(0, calculatedSubtotal - discountAmount);

    // 5. Calculate shipping delivery charge
    const deliveryCharge = discountedSubtotal > 3000 || items.length === 0 ? 0 : 199;
    const grandTotalAmount = Math.max(0, discountedSubtotal + deliveryCharge);

    // 6. Generate unique Order Number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 7. Check user auth context
    const userId = req.user ? req.user.id : null;

    // 8. Create Order document
    const newOrder = new Order({
      orderNumber,
      userId,
      items: formattedItems,
      shippingAddress: {
        fullName,
        email,
        phone,
        country,
        state,
        city,
        addressLine,
        roadArea,
        pincode,
      },
      orderSummary: {
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        deliveryCharge,
        totalAmount: grandTotalAmount,
        couponCode: cleanCoupon,
      },
      paymentDetails: {
        paymentMethod: paymentMethod || 'Pending',
        paymentStatus: 'Pending',
      },
      orderStatus: 'Placed',
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
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
 * @desc    Get order details by order ID or orderNumber
 * @route   GET /api/orders/:id
 * @access  Public / Private
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
 * @desc    Get orders for current authenticated user
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

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

/**
 * @desc    Update order payment status / method
 * @route   PATCH /api/orders/:id/payment
 * @access  Public / Private
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentStatus, transactionId } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (paymentMethod) order.paymentDetails.paymentMethod = paymentMethod;
    if (paymentStatus) order.paymentDetails.paymentStatus = paymentStatus;
    if (transactionId) order.paymentDetails.transactionId = transactionId;

    if (paymentStatus === 'Paid') {
      order.orderStatus = 'Processing';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment status',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updatePaymentStatus,
};
