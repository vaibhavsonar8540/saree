const Order = require('../models/Order');
const Saree = require('../models/Saree');
const { transitionOrder } = require('../utils/orderLifecycle');

/**
 * Sweeps for expired pending orders (where stock_reserved_until < NOW)
 * Cancels them and releases reserved stock back to active inventory.
 */
const cleanupExpiredPendingOrders = async () => {
  try {
    const now = new Date();
    const expiredOrders = await Order.find({
      orderStatus: { $in: ['pending', 'Placed'] },
      'paymentDetails.paymentStatus': { $in: ['unpaid', 'Pending'] },
      stock_reserved_until: { $lt: now, $ne: null },
    });

    if (expiredOrders.length === 0) {
      return 0;
    }

    console.log(`[Stock Cleanup Job] Found ${expiredOrders.length} expired pending orders. Processing stock releases...`);

    let cleanedCount = 0;

    for (const order of expiredOrders) {
      try {
        // Transition order status to cancelled
        transitionOrder(
          order,
          'cancelled',
          null, // Keep payment status as unpaid
          'system',
          `Order expired after 15 minutes of non-payment. Stock released.`
        );

        order.stock_reserved_until = null;
        await order.save();

        // Release reserved stock back to inventory atomically
        for (const item of order.items) {
          if (item.productId) {
            await Saree.findByIdAndUpdate(item.productId, {
              $inc: { stock: item.quantity, salesCount: -item.quantity },
            });
          }
        }

        console.log(`[Stock Cleanup Job] Successfully cancelled order ${order.orderNumber} & released stock.`);
        cleanedCount++;
      } catch (err) {
        console.error(`[Stock Cleanup Job Error] Failed to cleanup order ${order.orderNumber}:`, err.message);
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('[Stock Cleanup Job Error] Critical failure in cleanup task:', error.message);
    return 0;
  }
};

/**
 * Starts a recurring interval timer for stock cleanup.
 * @param {number} intervalMs - Default: 60 seconds (1 minute)
 */
const startStockCleanupScheduler = (intervalMs = 60000) => {
  console.log(`[Stock Cleanup Scheduler] Initialized. Running every ${intervalMs / 1000} seconds.`);
  // Run once on startup
  cleanupExpiredPendingOrders();
  // Schedule periodic runs
  const timerId = setInterval(cleanupExpiredPendingOrders, intervalMs);
  return timerId;
};

module.exports = {
  cleanupExpiredPendingOrders,
  startStockCleanupScheduler,
};
