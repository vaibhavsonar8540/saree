const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';

// SECURITY STARTUP GUARD: TEST MODE ONLY
if (key_id.startsWith('rzp_live_')) {
  const securityMsg = 'CRITICAL SECURITY GUARD EXCEPTION: This application is configured to run in TEST MODE ONLY. Live key (rzp_live_*) detected. Payment module initialization REFUSED!';
  console.error('\x1b[31m%s\x1b[0m', securityMsg);
  throw new Error(securityMsg);
}

let instance = null;

try {
  instance = new Razorpay({
    key_id,
    key_secret,
  });
  console.log(`[Razorpay Config] Payment module initialized in TEST MODE (Key ID: ${key_id})`);
} catch (error) {
  console.error('[Razorpay Config] Initialization warning:', error.message);
}

module.exports = {
  getRazorpayInstance: () => instance,
  RAZORPAY_KEY_ID: key_id,
  RAZORPAY_KEY_SECRET: key_secret,
  RAZORPAY_WEBHOOK_SECRET: webhook_secret,
  isTestMode: key_id.startsWith('rzp_test_'),
};
