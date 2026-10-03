const express = require('express');
const router = express.Router();
const {
  getFavourites,
  toggleFavourite,
  removeFromFavourite,
} = require('../controllers/favouriteController');
const { protect } = require('../middleware/authMiddleware');

// All favourite routes require authentication
router.use(protect);

router
  .route('/')
  .get(getFavourites)
  .post(toggleFavourite);

router.delete('/:productId', removeFromFavourite);

module.exports = router;
