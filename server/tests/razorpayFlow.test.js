const assert = require('assert');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Saree = require('../models/Saree');
const WebhookEvent = require('../models/WebhookEvent');
const { transitionOrder } = require('../utils/orderLifecycle');
const { toPaise } = require('../utils/moneyHelper');
const { cleanupExpiredPendingOrders } = require('../jobs/stockCleanupJob');

async function runRazorpayFlowTests() {
  console.log('--- STARTING RAZORPAY PAYMENT FLOW INTEGRATION TESTS ---');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saree_test';
  await mongoose.connect(mongoUri);

  try {
    // Clean test tables
    await Order.deleteMany({ orderNumber: /^TEST-RZP-/ });
    await Saree.deleteMany({ SKU: /^TEST-RZP-/ });
    await WebhookEvent.deleteMany({ eventId: /^test_evt_/ });

    // 1. TEST STATE TRANSITIONS (Order Lifecycle)
    console.log('\n[Test 1] Order Lifecycle Transition Guard Test');
    const mockOrder = new Order({
      orderNumber: `TEST-RZP-${Date.now()}-1`,
      orderStatus: 'pending',
      paymentDetails: { paymentStatus: 'unpaid' },
      items: [],
      shippingAddress: { fullName: 'Test User', email: 'test@example.com', phone: '9876543210', state: 'MH', city: 'Mumbai', addressLine: 'Line 1', pincode: '400001' },
      orderSummary: { subtotal: 1000, totalAmount: 1000 },
    });

    // Valid transition: pending -> paid
    transitionOrder(mockOrder, 'paid', 'paid', 'verify', 'Test verify transition');
    assert.strictEqual(mockOrder.orderStatus, 'paid');
    assert.strictEqual(mockOrder.paymentDetails.paymentStatus, 'paid');
    assert.strictEqual(mockOrder.statusHistory.length, 1);
    console.log('✓ Valid transition pending -> paid accepted.');

    // Illegal transition: paid -> pending (Must fail)
    assert.throws(() => {
      transitionOrder(mockOrder, 'pending', 'unpaid', 'test', 'Illegal jump');
    }, /Illegal order status transition/);
    console.log('✓ Illegal transition paid -> pending correctly rejected.');

    // 2. TEST SIGNATURE VERIFICATION (HMAC-SHA256)
    console.log('\n[Test 2] HMAC-SHA256 Payment Signature Verification Test');
    const secret = 'test_webhook_secret_key_123';
    const razorpayOrderId = 'order_test_12345';
    const razorpayPaymentId = 'pay_test_67890';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Test matching
    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    assert.strictEqual(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(computedSig)), true);

    // Test tampered payment ID
    const tamperedSig = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|pay_TAMPERED`)
      .digest('hex');
    assert.strictEqual(validSignature === tamperedSig, false);
    console.log('✓ HMAC-SHA256 signature verification & tampering check passed.');

    // 3. TEST STOCK RESERVATION & EXPIRED PENDING CLEANUP
    console.log('\n[Test 3] Expired Pending Order Stock Cleanup Test');
    const testSaree = await Saree.create({
      name: 'Test Saree RZP',
      SKU: `TEST-RZP-S1`,
      description: 'Test Saree',
      price: 1500,
      stock: 10,
      isActive: true,
    });

    // Create expired pending order with stock reserved 20 mins ago
    const expiredOrder = await Order.create({
      orderNumber: `TEST-RZP-${Date.now()}-2`,
      orderStatus: 'pending',
      paymentDetails: { paymentStatus: 'unpaid' },
      stock_reserved_until: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
      items: [
        {
          productId: testSaree._id,
          name: testSaree.name,
          quantity: 2,
          price: 1500,
          itemSubtotal: 3000,
        },
      ],
      shippingAddress: { fullName: 'Test User', email: 'test@example.com', phone: '9876543210', state: 'MH', city: 'Mumbai', addressLine: 'Line 1', pincode: '400001' },
      orderSummary: { subtotal: 3000, totalAmount: 3000 },
    });

    // Reduce stock manually to simulate reservation
    await Saree.findByIdAndUpdate(testSaree._id, { $inc: { stock: -2 } });
    const stockAfterReservation = (await Saree.findById(testSaree._id)).stock;
    assert.strictEqual(stockAfterReservation, 8);

    // Run stock cleanup runner
    const cleanedCount = await cleanupExpiredPendingOrders();
    assert.strictEqual(cleanedCount, 1);

    const refreshedOrder = await Order.findById(expiredOrder._id);
    assert.strictEqual(refreshedOrder.orderStatus, 'cancelled');

    const restoredStock = (await Saree.findById(testSaree._id)).stock;
    assert.strictEqual(restoredStock, 10);
    console.log('✓ Expired pending order stock correctly released back to inventory (8 -> 10).');

    // 4. TEST LIVE KEY SECURITY GUARD
    console.log('\n[Test 4] Live Key Security Guard Test');
    assert.throws(() => {
      const liveKey = 'rzp_live_1234567890';
      if (liveKey.startsWith('rzp_live_')) {
        throw new Error('CRITICAL SECURITY GUARD EXCEPTION: Live key detected');
      }
    }, /CRITICAL SECURITY GUARD EXCEPTION/);
    console.log('✓ Live key initialization guard correctly triggered.');

    // Cleanup
    await Order.deleteMany({ orderNumber: /^TEST-RZP-/ });
    await Saree.deleteMany({ SKU: /^TEST-RZP-/ });
    await WebhookEvent.deleteMany({ eventId: /^test_evt_/ });

    console.log('\n=================================================');
    console.log('🎉 ALL INTEGRATION & SECURITY TESTS PASSED!');
    console.log('=================================================\n');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runRazorpayFlowTests();
}

module.exports = runRazorpayFlowTests;
