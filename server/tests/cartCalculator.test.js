const assert = require('assert');
const mongoose = require('mongoose');
const { calculateCartTotals } = require('../utils/cartCalculator');
const Saree = require('../models/Saree');
const ShippingSettings = require('../models/ShippingSettings');
const Pincode = require('../models/Pincode');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// Simple isolated test script runner for Node.js
async function runTests() {
  console.log('--- STARTING CART CALCULATOR & BACKEND SECURITY TESTS ---');

  try {
    // 1. Setup mock/in-memory Mongo connection or verify logic directly
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saree_test';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB for tests');

    // Clean test data
    await Saree.deleteMany({ SKU: /^TEST-/ });
    await Coupon.deleteMany({ code: /^TEST/ });
    await Pincode.deleteMany({ pincode: /^99/ });
    await Order.deleteMany({ orderNumber: /^TEST-/ });

    // Ensure default shipping settings exist
    await ShippingSettings.deleteMany({});
    await ShippingSettings.create({
      minFreeShippingThreshold: 999,
      flatShippingRate: 199,
      isShippingActive: true,
    });

    // Create Test Sarees
    const saree1 = await Saree.create({
      name: 'Test Banarasi Saree',
      SKU: 'TEST-101',
      description: 'Luxury Saree Test',
      price: 1500,
      discountedPrice: 1200,
      stock: 10,
      isActive: true,
    });

    const saree2 = await Saree.create({
      name: 'Test Cotton Saree',
      SKU: 'TEST-102',
      description: 'Cotton Saree Test',
      price: 500,
      discountedPrice: 400,
      stock: 5,
      isActive: true,
    });

    const outOfStockSaree = await Saree.create({
      name: 'Test Out of Stock Saree',
      SKU: 'TEST-103',
      description: 'Out of Stock Test',
      price: 2000,
      stock: 0,
      isActive: true,
    });

    // Create Test Coupon
    await Coupon.create({
      code: 'TEST20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 500,
      isActive: true,
    });

    // Create Test Pincode
    await Pincode.create({
      pincode: '999999',
      city: 'Test City',
      state: 'Test State',
      isServiceable: true,
    });

    await Pincode.create({
      pincode: '999000',
      city: 'Unserviceable City',
      state: 'Test State',
      isServiceable: false,
    });

    // TEST 1: Normal Calculation & Free Shipping Threshold (Subtotal >= 999 -> Shipping 0)
    console.log('\n[Test 1] Free Shipping Threshold Test (Subtotal >= 999)');
    const res1 = await calculateCartTotals({
      cartItems: [{ productId: saree1._id, quantity: 1 }], // price 1200
    });
    assert.strictEqual(res1.summary.subtotal, 1200);
    assert.strictEqual(res1.summary.shipping, 0); // 1200 >= 999 -> Free shipping
    assert.strictEqual(res1.summary.total, 1200);
    console.log('✓ Test 1 Passed! (Subtotal ₹1200, Shipping ₹0, Total ₹1200)');

    // TEST 2: Under-Threshold Shipping Charge (Subtotal < 999 -> Shipping 199)
    console.log('\n[Test 2] Under-Threshold Shipping Charge Test (Subtotal < 999)');
    const res2 = await calculateCartTotals({
      cartItems: [{ productId: saree2._id, quantity: 1 }], // price 400
    });
    assert.strictEqual(res2.summary.subtotal, 400);
    assert.strictEqual(res2.summary.shipping, 199); // 400 < 999 -> ₹199 shipping
    assert.strictEqual(res2.summary.total, 599);
    console.log('✓ Test 2 Passed! (Subtotal ₹400, Shipping ₹199, Total ₹599)');

    // TEST 3: Coupon Application (TEST20 = 20% off 1200 = 240)
    console.log('\n[Test 3] Coupon Application Test (20% off)');
    const res3 = await calculateCartTotals({
      cartItems: [{ productId: saree1._id, quantity: 1 }],
      couponCode: 'TEST20',
    });
    assert.strictEqual(res3.summary.subtotal, 1200);
    assert.strictEqual(res3.summary.discount, 240);
    assert.strictEqual(res3.summary.total, 960);
    assert.strictEqual(res3.coupon.applied, true);
    console.log('✓ Test 3 Passed! (Discount ₹240, Total ₹960)');

    // TEST 4: Out of stock item exclusion & warnings
    console.log('\n[Test 4] Out of Stock Item Exclusion Test');
    const res4 = await calculateCartTotals({
      cartItems: [
        { productId: saree1._id, quantity: 1 },
        { productId: outOfStockSaree._id, quantity: 1 },
      ],
    });
    assert.strictEqual(res4.items.length, 1); // Only 1 active item
    assert.strictEqual(res4.warnings.length, 1);
    assert.strictEqual(res4.warnings[0].type, 'OUT_OF_STOCK');
    console.log('✓ Test 4 Passed! Out-of-stock item correctly excluded with warning.');

    // TEST 5: Price Tampering Test (Client sends fake price ₹1, backend fetches DB price ₹1200)
    console.log('\n[Test 5] Price Tampering Protection Test');
    const res5 = await calculateCartTotals({
      cartItems: [{ productId: saree1._id, quantity: 1, price: 1 }], // Fake client price
    });
    assert.strictEqual(res5.items[0].unitPrice, 1200); // DB price enforced
    assert.strictEqual(res5.summary.subtotal, 1200);
    assert.strictEqual(res5.warnings.some((w) => w.type === 'PRICE_CHANGED'), true);
    console.log('✓ Test 5 Passed! Client fake price ignored, DB price ₹1200 enforced.');

    // TEST 6: Pincode Lookup Test (Serviceable vs Unserviceable)
    console.log('\n[Test 6] Pincode Lookup Serviceability Test');
    const res6a = await calculateCartTotals({
      cartItems: [{ productId: saree1._id, quantity: 1 }],
      pincode: '999999',
    });
    assert.strictEqual(res6a.pincodeInfo.isServiceable, true);

    const res6b = await calculateCartTotals({
      cartItems: [{ productId: saree1._id, quantity: 1 }],
      pincode: '999000',
    });
    assert.strictEqual(res6b.pincodeInfo.isServiceable, false);
    console.log('✓ Test 6 Passed! Pincode serviceability accurately checked.');

    // Clean up test items
    await Saree.deleteMany({ SKU: /^TEST-/ });
    await Coupon.deleteMany({ code: /^TEST/ });
    await Pincode.deleteMany({ pincode: /^99/ });

    console.log('\n=================================================');
    console.log('🎉 ALL UNIT & SECURITY TESTS PASSED SUCCESSFULLY!');
    console.log('=================================================\n');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
