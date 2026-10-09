const assert = require('assert');
const { toPaise, fromPaise, toRupees } = require('../utils/moneyHelper');

function runMoneyHelperTests() {
  console.log('--- STARTING MONEY HELPER UNIT TESTS ---');

  // TEST 1: Standard rupee float to paise integer conversion
  assert.strictEqual(toPaise(99.99), 9999);
  assert.strictEqual(toPaise(100), 10000);
  assert.strictEqual(toPaise(0), 0);
  console.log('✓ Test 1: Standard rupee to paise conversion passed (99.99 -> 9999)');

  // TEST 2: Floating point rounding precision edge cases (0.1 + 0.2 = 0.30000000000000004)
  const floatSum = 0.1 + 0.2;
  assert.strictEqual(toPaise(floatSum), 30);
  console.log('✓ Test 2: Floating point precision edge case (0.1 + 0.2) passed (0.30 -> 30 paise)');

  // TEST 3: Large financial values
  const largeAmount = 999999.99;
  assert.strictEqual(toPaise(largeAmount), 99999999);
  assert.strictEqual(fromPaise(99999999), 999999.99);
  console.log('✓ Test 3: Large amount conversion passed (999999.99 -> 99999999 paise)');

  // TEST 4: Paise integer to rupee float conversion
  assert.strictEqual(fromPaise(9999), 99.99);
  assert.strictEqual(fromPaise(10000), 100.00);
  assert.strictEqual(fromPaise(0), 0.00);
  console.log('✓ Test 4: Paise to rupee conversion passed (9999 paise -> ₹99.99)');

  // TEST 5: String input handling
  assert.strictEqual(toPaise('1499.50'), 149950);
  assert.strictEqual(fromPaise('149950'), 1499.50);
  assert.strictEqual(toRupees('1499.509'), 1499.51);
  console.log('✓ Test 5: String inputs & float formatting passed');

  // TEST 6: Invalid amount error handling
  assert.throws(() => toPaise(-10), /Invalid rupee amount/);
  assert.throws(() => fromPaise('abc'), /Invalid paise amount/);
  console.log('✓ Test 6: Invalid negative/nan input guards passed');

  console.log('=================================================');
  console.log('🎉 ALL MONEY HELPER TESTS PASSED SUCCESSFULLY!');
  console.log('=================================================\n');
}

if (require.main === module) {
  runMoneyHelperTests();
}

module.exports = runMoneyHelperTests;
