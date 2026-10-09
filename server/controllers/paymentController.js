const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Saree = require('../models/Saree');
const WebhookEvent = require('../models/WebhookEvent');
const { getRazorpayInstance, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('../config/razorpay');
const { toPaise, fromPaise, toRupees } = require('../utils/moneyHelper');
const { calculateCartTotals } = require('../utils/cartCalculator');
const { transitionOrder } = require('../utils/orderLifecycle');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

/**
 * Helper to check order ownership safely
 */
const verifyOrderOwnership = (order, req) => {
  if (!order) return false;
  
  // Admin role override
  if (req.user && req.user.role === 'admin') return true;

  // Authenticated user check
  if (req.user && order.userId) {
    return order.userId.toString() === req.user._id.toString();
  }

  // Guest session check via order email/phone matching or guestToken
  if (req.guestToken && req.cookies && req.cookies.guestToken === req.guestToken) {
    return true;
  }

  return false;
};

/**
 * @desc    Create Razorpay Order for an existing pending order
 * @route   POST /api/payment/create-order
 * @access  Protected (Auth User / Guest Session)
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Internal Order ID or Order Number is required',
      });
    }

    // 1. Load order from DB
    let order = await Order.findById(orderId);
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (!verifyOrderOwnership(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to initiate payment for this order',
      });
    }

    // Verify order status is pending and unpaid
    const isPending = ['pending', 'Placed'].includes(order.orderStatus);
    const isUnpaid = ['unpaid', 'Pending', 'failed', 'Failed'].includes(order.paymentDetails?.paymentStatus);

    if (!isPending || !isUnpaid) {
      return res.status(400).json({
        success: false,
        message: `Order status (${order.orderStatus}/${order.paymentDetails?.paymentStatus}) is not eligible for payment.`,
      });
    }

    // 2. Re-validate cart/stock & price consistency
    const calculation = await calculateCartTotals({
      cartItems: order.items,
      couponCode: order.orderSummary.couponCode,
      pincode: order.shippingAddress.pincode,
    });

    if (toRupees(calculation.summary.total) !== toRupees(order.orderSummary.totalAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items or prices have changed. Please review your order totals before proceeding.',
        recalculatedTotal: calculation.summary.total,
        orderTotal: order.orderSummary.totalAmount,
      });
    }

    // 3. Reuse existing razorpay_order_id if present and still valid
    if (order.razorpay_order_id) {
      console.log(`[Razorpay Payment] Reusing existing razorpay_order_id ${order.razorpay_order_id} for order ${order.orderNumber}`);
      return res.status(200).json({
        success: true,
        message: 'Razorpay payment order ready',
        data: {
          razorpay_order_id: order.razorpay_order_id,
          key_id: RAZORPAY_KEY_ID,
          amount: order.orderSummary.totalAmount,
          amount_paise: toPaise(order.orderSummary.totalAmount),
          currency: order.currency || 'INR',
          order_number: order.orderNumber,
          prefill: {
            name: order.shippingAddress.fullName,
            email: order.shippingAddress.email,
            phone: order.shippingAddress.phone,
          },
        },
      });
    }

    // 4. Call Razorpay Orders API
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay payment service is currently unavailable',
      });
    }

    const amountInPaise = toPaise(order.orderSummary.totalAmount);
    const razorpayOrderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        internal_order_id: order._id.toString(),
        order_number: order.orderNumber,
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

    // 5. Save razorpay_order_id to internal order
    order.razorpay_order_id = razorpayOrder.id;
    await order.save();

    console.log(`[Razorpay Payment] Created Razorpay order ${razorpayOrder.id} for order ${order.orderNumber} (Paise: ${amountInPaise})`);

    // 6. Return payload for frontend Razorpay Checkout modal
    res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        razorpay_order_id: razorpayOrder.id,
        key_id: RAZORPAY_KEY_ID,
        amount: order.orderSummary.totalAmount,
        amount_paise: amountInPaise,
        currency: 'INR',
        order_number: order.orderNumber,
        prefill: {
          name: order.shippingAddress.fullName,
          email: order.shippingAddress.email,
          phone: order.shippingAddress.phone,
        },
      },
    });
  } catch (error) {
    console.error('[Razorpay Payment Error] createPaymentOrder failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature & Confirm Order
 * @route   POST /api/payment/verify
 * @access  Protected (Auth User / Guest Session)
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay verification credentials',
      });
    }

    // 1. Find internal order by razorpay_order_id
    const order = await Order.findOne({ razorpay_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order associated with this Razorpay payment ID was not found',
      });
    }

    // Verify ownership
    if (!verifyOrderOwnership(order, req)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify payment for this order',
      });
    }

    // Idempotency check: if order is already marked paid
    if (order.paymentDetails?.paymentStatus === 'paid' && order.orderStatus === 'paid') {
      console.log(`[Razorpay Payment] Verify call for already paid order ${order.orderNumber}. Returning success.`);
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and confirmed',
        data: {
          orderNumber: order.orderNumber,
          amount: order.orderSummary.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentDetails.paymentStatus,
        },
      });
    }

    // 2. Compute expected HMAC-SHA256 signature using RAZORPAY_KEY_SECRET
    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(bodyToSign)
      .digest('hex');

    // Constant-time signature comparison to prevent timing side-channel attacks
    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );

    if (!isSignatureValid) {
      console.error(`[Razorpay Security Alert] Invalid payment signature attempt for order ${order.orderNumber}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch',
      });
    }

    // 3. Fetch payment details from Razorpay API for double verification
    const razorpay = getRazorpayInstance();
    if (razorpay) {
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

        if (paymentDetails.order_id !== razorpay_order_id) {
          return res.status(400).json({
            success: false,
            message: 'Payment details mismatch with order ID',
          });
        }

        const expectedPaise = toPaise(order.orderSummary.totalAmount);
        if (paymentDetails.amount !== expectedPaise) {
          console.error(`[Razorpay Error] Amount mismatch! DB Paise: ${expectedPaise}, Razorpay Paise: ${paymentDetails.amount}`);
          return res.status(400).json({
            success: false,
            message: 'Payment verification failed: Amount mismatch',
          });
        }

        // Auto-capture if authorized
        if (paymentDetails.status === 'authorized') {
          await razorpay.payments.capture(razorpay_payment_id, expectedPaise, 'INR');
        }
      } catch (rzpErr) {
        console.warn(`[Razorpay API Verification Warning] Could not fetch payment API details: ${rzpErr.message}`);
      }
    }

    // 4. Update order state idempotently using transition helper
    transitionOrder(order, 'paid', 'paid', 'verify', 'Razorpay signature verified successfully');
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.paymentDetails.transactionId = razorpay_payment_id;
    order.paymentDetails.paymentMethod = 'Razorpay';
    order.paid_at = new Date();
    order.stock_reserved_until = null; // Clear stock reservation expiry since paid

    await order.save();

    // 5. Clear User / Guest Cart
    try {
      if (order.userId) {
        await Cart.findOneAndUpdate({ userId: order.userId }, { items: [], couponCode: '' });
      } else if (req.guestToken) {
        await Cart.findOneAndUpdate({ guestToken: req.guestToken }, { items: [], couponCode: '' });
      }
    } catch (cartErr) {
      console.error('[Cart Clear Warning]:', cartErr.message);
    }

    // 6. Send confirmation email asynchronously (Guarded by confirmationSent)
    sendOrderConfirmationEmail(order);

    console.log(`[Razorpay Payment] Order ${order.orderNumber} successfully VERIFIED and confirmed PAID.`);

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        orderNumber: order.orderNumber,
        amount: order.orderSummary.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails.paymentStatus,
        paidAt: order.paid_at,
      },
    });
  } catch (error) {
    console.error('[Razorpay Verify Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Public Razorpay Webhook Handler
 * @route   POST /api/payment/webhook
 * @access  Public (Authenticated by HMAC Signature only)
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const eventId = req.headers['x-razorpay-event-id'] || req.body?.payload?.payment?.entity?.id || `evt_${Date.now()}`;

    if (!signature) {
      console.error('[Webhook Error] Missing X-Razorpay-Signature header');
      return res.status(400).json({ success: false, message: 'Missing signature header' });
    }

    // Raw body check
    const rawBody = req.rawBody || JSON.stringify(req.body);

    // 1. Verify Webhook HMAC-SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const isSignatureValid =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );

    if (!isSignatureValid) {
      console.error('[Webhook Security Alert] Invalid Webhook Signature');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // 2. Idempotency Check via WebhookEvent model
    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent) {
      console.log(`[Webhook Idempotency] Event ${eventId} already processed. Returning 200 OK.`);
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    const payload = req.body || {};
    const eventType = payload.event;
    console.log(`[Webhook Event Received] Type: ${eventType}, Event ID: ${eventId}`);

    // Record Event log in DB
    await WebhookEvent.create({
      eventId,
      eventType: eventType || 'unknown',
      payload,
      status: 'processed',
    });

    // 3. Process Events
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
      const razorpay_order_id = paymentEntity?.order_id;
      const razorpay_payment_id = paymentEntity?.id;
      const eventAmountPaise = paymentEntity?.amount;

      if (razorpay_order_id) {
        const order = await Order.findOne({ razorpay_order_id });
        if (order) {
          const expectedPaise = toPaise(order.orderSummary.totalAmount);
          
          if (eventAmountPaise && eventAmountPaise !== expectedPaise) {
            console.error(`[Webhook Error] Amount mismatch for order ${order.orderNumber}. Event Paise: ${eventAmountPaise}, Expected: ${expectedPaise}`);
            return res.status(200).json({ success: true, message: 'Amount mismatch logged' });
          }

          // Edge case check: If order was cancelled / expired prior to late payment arrival
          if (['cancelled', 'Cancelled'].includes(order.orderStatus)) {
            console.warn(`[Webhook Warning] Late payment captured for CANCELLED order ${order.orderNumber}. Flagging for manual review/refund.`);
            order.paymentDetails.paymentStatus = 'manual_review';
            order.statusHistory.push({
              orderStatus: order.orderStatus,
              paymentStatus: 'manual_review',
              timestamp: new Date(),
              source: 'webhook',
              reason: `Late payment.captured received for cancelled order. Razorpay Payment ID: ${razorpay_payment_id}`,
            });
            await order.save();

            // Attempt auto-refund via Razorpay API
            const razorpay = getRazorpayInstance();
            if (razorpay && razorpay_payment_id) {
              try {
                await razorpay.payments.refund(razorpay_payment_id, {
                  amount: eventAmountPaise,
                  notes: { reason: 'Auto-refund for late payment on cancelled order' },
                });
                console.log(`[Webhook Auto-Refund] Issued refund for payment ${razorpay_payment_id}`);
              } catch (refErr) {
                console.error(`[Webhook Auto-Refund Error]: ${refErr.message}`);
              }
            }
            return res.status(200).json({ success: true, message: 'Late payment flagged for review' });
          }

          // Normal payment confirmation path if order is pending
          if (['pending', 'Placed'].includes(order.orderStatus)) {
            transitionOrder(order, 'paid', 'paid', 'webhook', `Razorpay Webhook Event: ${eventType}`);
            order.razorpay_payment_id = razorpay_payment_id || order.razorpay_payment_id;
            order.paymentDetails.transactionId = razorpay_payment_id || order.paymentDetails.transactionId;
            order.paymentDetails.paymentMethod = paymentEntity?.method || 'Razorpay';
            order.paid_at = new Date();
            order.stock_reserved_until = null;

            await order.save();

            // Clear Cart
            if (order.userId) {
              await Cart.findOneAndUpdate({ userId: order.userId }, { items: [], couponCode: '' });
            }

            // Send Email
            sendOrderConfirmationEmail(order);
            console.log(`[Webhook Success] Order ${order.orderNumber} confirmed paid via webhook.`);
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpay_order_id = paymentEntity?.order_id;
      const failReason = paymentEntity?.error_description || 'Payment execution failed';

      if (razorpay_order_id) {
        const order = await Order.findOne({ razorpay_order_id });
        if (order && ['pending', 'Placed'].includes(order.orderStatus)) {
          order.paymentDetails.paymentStatus = 'failed';
          order.statusHistory.push({
            orderStatus: order.orderStatus,
            paymentStatus: 'failed',
            timestamp: new Date(),
            source: 'webhook',
            reason: `Payment failed: ${failReason}`,
          });
          await order.save();
          console.log(`[Webhook Payment Failed] Order ${order.orderNumber} payment marked failed.`);
        }
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      const razorpay_payment_id = refundEntity?.payment_id;
      const refundId = refundEntity?.id;
      const refundedPaise = refundEntity?.amount;

      if (razorpay_payment_id) {
        const order = await Order.findOne({ razorpay_payment_id });
        if (order) {
          const refundedRupees = fromPaise(refundedPaise);
          order.refundDetails = {
            refundId: refundId || '',
            refundedAmount: refundedRupees,
            refundedAt: new Date(),
          };

          const isFullRefund = refundedRupees >= order.orderSummary.totalAmount;
          const nextPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';
          const nextOrderStatus = isFullRefund ? 'refunded' : order.orderStatus;

          transitionOrder(order, nextOrderStatus, nextPaymentStatus, 'webhook', `Refund processed: ₹${refundedRupees}`);
          
          // Restore stock if fully refunded
          if (isFullRefund) {
            for (const item of order.items) {
              if (item.productId) {
                await Saree.findByIdAndUpdate(item.productId, {
                  $inc: { stock: item.quantity, salesCount: -item.quantity },
                });
              }
            }
          }

          await order.save();
          console.log(`[Webhook Refund Processed] Order ${order.orderNumber} refunded ₹${refundedRupees}`);
        }
      }
    }

    // Always respond 200 OK to Razorpay webhook ping
    res.status(200).json({ success: true, message: 'Webhook event processed successfully' });
  } catch (error) {
    console.error('[Webhook Controller Error]:', error);
    res.status(500).json({ success: false, message: 'Webhook processing internal error' });
  }
};

/**
 * @desc    Get order payment status (Polling endpoint for frontend)
 * @route   GET /api/payment/status/:orderId
 * @access  Protected
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    let order = await Order.findById(orderId);
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!verifyOrderOwnership(order, req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to check status' });
    }

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentDetails?.paymentStatus,
        isPaid: order.paymentDetails?.paymentStatus === 'paid',
        paidAt: order.paid_at,
        totalAmount: order.orderSummary.totalAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch status', error: error.message });
  }
};

/**
 * @desc    Cancel order and issue Razorpay refund if paid
 * @route   POST /api/payment/cancel/:orderId
 * @access  Protected
 */
const cancelOrderAndRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason = 'Cancelled by user' } = req.body;

    let order = await Order.findById(orderId);
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!verifyOrderOwnership(order, req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel order' });
    }

    if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order in '${order.orderStatus}' status cannot be cancelled.`,
      });
    }

    const isPaid = order.paymentDetails?.paymentStatus === 'paid';

    // Issue Razorpay Refund if order was paid
    if (isPaid && order.razorpay_payment_id) {
      const razorpay = getRazorpayInstance();
      if (razorpay) {
        const refundPaise = toPaise(order.orderSummary.totalAmount);
        const refundRes = await razorpay.payments.refund(order.razorpay_payment_id, {
          amount: refundPaise,
          notes: { reason },
        });

        order.refundDetails = {
          refundId: refundRes.id,
          refundedAmount: order.orderSummary.totalAmount,
          refundedAt: new Date(),
        };

        transitionOrder(order, 'cancelled', 'refunded', 'user', `Cancelled by user. Refund issued (${refundRes.id})`);
      } else {
        transitionOrder(order, 'cancelled', 'refunded', 'user', 'Cancelled by user');
      }
    } else {
      transitionOrder(order, 'cancelled', null, 'user', reason);
    }

    // Restore stock to inventory
    for (const item of order.items) {
      if (item.productId) {
        await Saree.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, salesCount: -item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully' + (isPaid ? ' and refund initiated' : ''),
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  cancelOrderAndRefund,
};
