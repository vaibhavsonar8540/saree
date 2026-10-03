const express = require('express');
const router = express.Router();
const {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  seedSubCategories,
} = require('../controllers/subCategoryController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// Seed route
router.post('/seed', seedSubCategories);

// Root routes: GET (Public), POST (Protected / Admin)
router
  .route('/')
  .get(getSubCategories)
  .post(protect, checkRole('admin'), createSubCategory);

// ID-specific routes: GET (Public), PUT (Protected / Admin), DELETE (Protected / Admin)
router
  .route('/:id')
  .get(getSubCategoryById)
  .put(protect, checkRole('admin'), updateSubCategory)
  .delete(protect, checkRole('admin'), deleteSubCategory);

module.exports = router;
