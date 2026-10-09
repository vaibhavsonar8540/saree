const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Middleware for guest or authenticated user identification
 * Attaches req.user (if token valid) OR req.guestToken (if guest)
 */
const guestOrUserAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_key'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Invalid/expired auth token, fall back to guest token
    }
  }

  // Handle guest token identification
  let guestToken =
    req.headers['x-guest-token'] ||
    (req.cookies && req.cookies.guestToken);

  if (!guestToken || typeof guestToken !== 'string' || guestToken.trim() === '') {
    guestToken = `guest_${crypto.randomBytes(16).toString('hex')}`;
  }

  req.guestToken = guestToken;
  
  // Set guest cookie if not set
  res.cookie('guestToken', guestToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
  });
  
  res.setHeader('X-Guest-Token', guestToken);
  next();
};

module.exports = {
  guestOrUserAuth,
};
