const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require('../controllers/categoryController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Seed route
router.post('/seed', seedCategories);

// Root routes: GET (Public), POST (Protected / Admin)
router
  .route('/')
  .get(getCategories)
  .post(protect, checkRole('admin'), createCategory);

// ID-specific routes: GET (Public), PUT (Protected / Admin), DELETE (Protected / Admin)
router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, checkRole('admin'), updateCategory)
  .delete(protect, checkRole('admin'), deleteCategory);

module.exports = router;
