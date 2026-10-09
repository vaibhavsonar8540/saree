/**
 * Express middleware to capture raw request body buffer for HMAC webhook verification.
 */
const express = require('express');

const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

const rawBodyMiddleware = express.json({
  verify: rawBodySaver,
  limit: '10mb',
});

module.exports = {
  rawBodyMiddleware,
  rawBodySaver,
};
