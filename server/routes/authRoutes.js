const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateDetails } = require('../controllers/authController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (requires valid JWT token cookie or Bearer token)
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

// Example protected route for all authenticated users (default role 'user' or 'admin')
router.get('/user-route', protect, checkRole('user', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the protected user dashboard!',
    user: req.user,
  });
});

// Example protected route for admin role ONLY
router.get('/admin-route', protect, checkRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the protected admin dashboard!',
    user: req.user,
  });
});

module.exports = router;
