const express = require('express');
const router = express.Router();
const {
  createSaree,
  getSarees,
  searchSarees,
  getSareeById,
  updateSaree,
  deleteSaree,
} = require('../controllers/sareeController');
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Search route: GET /api/sarees/search
router.get('/search', searchSarees);

// Root routes: GET (Public), POST (Protected / Admin with file upload support)
router
  .route('/')
  .get(getSarees)
  .post(protect, checkRole('admin'), upload.any(), createSaree);

// ID-specific routes: GET (Public), PUT (Protected / Admin with file upload support), DELETE (Protected / Admin)
router
  .route('/:id')
  .get(getSareeById)
  .put(protect, checkRole('admin'), upload.any(), updateSaree)
  .delete(protect, checkRole('admin'), deleteSaree);

module.exports = router;
