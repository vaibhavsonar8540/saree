/**
 * Simple in-memory rate limiter middleware for sensitive payment endpoints
 */

const requestCounts = new Map();

/**
 * Rate limiter middleware function
 * @param {Object} options - { windowMs: 15*60*1000, max: 20 }
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 30; // Max requests per window per IP

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    const record = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(key, record);

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many payment requests from this IP, please try again later.',
      });
    }

    next();
  };
};

module.exports = {
  paymentRateLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
};
