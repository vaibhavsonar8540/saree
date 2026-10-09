/**
 * Single source of truth function for validating and recording order status transitions.
 */

// Define allowed transitions for orderStatus
const ALLOWED_ORDER_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  Placed: ['pending', 'paid', 'cancelled'], // Backward compatibility mapping
  paid: ['shipped', 'cancelled', 'refunded'],
  Processing: ['shipped', 'cancelled', 'refunded'], // Backward compatibility mapping
  shipped: ['delivered', 'cancelled'],
  Shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal
  Delivered: [],
  cancelled: [], // Terminal
  Cancelled: [],
  refunded: [], // Terminal
};

// Define allowed transitions for paymentStatus
const ALLOWED_PAYMENT_TRANSITIONS = {
  unpaid: ['paid', 'failed', 'manual_review'],
  Pending: ['paid', 'failed', 'manual_review'], // Backward compatibility mapping
  failed: ['paid', 'unpaid'],
  Failed: ['paid', 'unpaid'],
  paid: ['refunded', 'partially_refunded'],
  Paid: ['refunded', 'partially_refunded'],
  refunded: [],
  partially_refunded: ['refunded'],
  manual_review: ['paid', 'refunded', 'cancelled'],
};

/**
 * Transitions order and payment status while appending to statusHistory log.
 * 
 * @param {Object} order - Mongoose order document
 * @param {String} nextOrderStatus - Target order status
 * @param {String} nextPaymentStatus - Target payment status
 * @param {String} source - Source of transition: 'verify' | 'webhook' | 'admin' | 'system' | 'user'
 * @param {String} reason - Detailed rationale for transition
 * @returns {Object} Updated order document
 */
const transitionOrder = (order, nextOrderStatus, nextPaymentStatus, source = 'system', reason = '') => {
  const currentOrderStatus = order.orderStatus || 'pending';
  const currentPaymentStatus = order.paymentDetails?.paymentStatus || 'unpaid';

  // 1. Check Order Status Transition
  if (nextOrderStatus && nextOrderStatus !== currentOrderStatus) {
    const allowedTargets = ALLOWED_ORDER_TRANSITIONS[currentOrderStatus] || [];
    if (!allowedTargets.includes(nextOrderStatus)) {
      throw new Error(
        `Illegal order status transition from '${currentOrderStatus}' to '${nextOrderStatus}' (source: ${source})`
      );
    }
    order.orderStatus = nextOrderStatus;
    if (nextOrderStatus === 'paid') {
      order.paid_at = order.paid_at || new Date();
    } else if (nextOrderStatus === 'cancelled') {
      order.cancelled_at = order.cancelled_at || new Date();
    }
  }

  // 2. Check Payment Status Transition
  if (nextPaymentStatus && nextPaymentStatus !== currentPaymentStatus) {
    const allowedTargets = ALLOWED_PAYMENT_TRANSITIONS[currentPaymentStatus] || [];
    if (!allowedTargets.includes(nextPaymentStatus)) {
      throw new Error(
        `Illegal payment status transition from '${currentPaymentStatus}' to '${nextPaymentStatus}' (source: ${source})`
      );
    }
    order.paymentDetails.paymentStatus = nextPaymentStatus;
  }

  // 3. Append to statusHistory audit trail
  if (!Array.isArray(order.statusHistory)) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentDetails.paymentStatus,
    timestamp: new Date(),
    source,
    reason: reason || `Status updated to ${order.orderStatus}/${order.paymentDetails.paymentStatus}`,
  });

  return order;
};

module.exports = {
  transitionOrder,
  ALLOWED_ORDER_TRANSITIONS,
  ALLOWED_PAYMENT_TRANSITIONS,
};
