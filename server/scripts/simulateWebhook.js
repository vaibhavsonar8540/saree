/**
 * TEST-ONLY Helper Script to simulate Razorpay Webhooks locally.
 * Generates an HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET and posts to /api/payment/webhook.
 * 
 * Usage:
 * node scripts/simulateWebhook.js <razorpay_order_id> [event_type]
 * Example:
 * node scripts/simulateWebhook.js order_P123456789 payment.captured
 */

const crypto = require('crypto');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'sample_webhook_secret_123456';
const razorpayOrderId = process.argv[2] || 'order_test123';
const eventType = process.argv[3] || 'payment.captured';
const paymentId = `pay_${Date.now()}`;
const eventId = `evt_${Date.now()}`;

const payload = {
  entity: 'event',
  account_id: 'acc_test123',
  event: eventType,
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: paymentId,
        entity: 'payment',
        amount: 999900, // in paise
        currency: 'INR',
        status: eventType === 'payment.captured' ? 'captured' : 'failed',
        order_id: razorpayOrderId,
        method: 'card',
        error_description: eventType === 'payment.failed' ? 'Card declined by issuing bank' : null,
      },
    },
  },
  created_at: Math.floor(Date.now() / 1000),
};

const rawBody = JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex');

console.log(`[Webhook Simulator] Sending event '${eventType}' for Razorpay order ID '${razorpayOrderId}'...`);
console.log(`Generated HMAC Signature: ${signature}`);

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/payment/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(rawBody),
    'X-Razorpay-Signature': signature,
    'X-Razorpay-Event-Id': eventId,
  },
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(`[Webhook Simulator Response] Status: ${res.statusCode}`);
    console.log(`Response Body: ${responseData}`);
  });
});

req.on('error', (err) => {
  console.error('[Webhook Simulator Error]:', err.message);
});

req.write(rawBody);
req.end();
