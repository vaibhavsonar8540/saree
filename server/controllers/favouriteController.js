const Favourite = require('../models/Favourite');
const Saree = require('../models/Saree');

// @desc    Get current user's favourite / wishlist products
// @route   GET /api/favourites
// @access  Private
const getFavourites = async (req, res) => {
  try {
    let favourite = await Favourite.findOne({ userId: req.user.id }).populate({
      path: 'products',
      populate: [
        { path: 'colors', select: 'name hexCode' },
        { path: 'colorMedia.colorId', select: 'name hexCode' },
      ],
    });

    if (!favourite) {
      favourite = await Favourite.create({ userId: req.user.id, products: [] });
    }

    // Filter out any deleted products
    const activeProducts = (favourite.products || []).filter(Boolean);

    res.status(200).json({
      success: true,
      count: activeProducts.length,
      data: activeProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favourite products',
      error: error.message,
    });
  }
};

// @desc    Add or toggle product in user's favourite list
// @route   POST /api/favourites
// @access  Private
const toggleFavourite = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID (productId) is required',
      });
    }

    // Verify product exists
    const product = await Saree.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let favourite = await Favourite.findOne({ userId: req.user.id });

    if (!favourite) {
      favourite = new Favourite({ userId: req.user.id, products: [] });
    }

    const index = favourite.products.indexOf(productId);
    let isFavourite = false;
    let message = '';

    if (index > -1) {
      // Remove from favourites
      favourite.products.splice(index, 1);
      isFavourite = false;
      message = 'Product removed from favourites';
    } else {
      // Add to favourites
      favourite.products.push(productId);
      isFavourite = true;
      message = 'Product added to favourites';
    }

    await favourite.save();

    const updatedFavourite = await Favourite.findById(favourite._id).populate({
      path: 'products',
      populate: [
        { path: 'colors', select: 'name hexCode' },
        { path: 'colorMedia.colorId', select: 'name hexCode' },
      ],
    });

    res.status(200).json({
      success: true,
      message,
      isFavourite,
      count: updatedFavourite.products.length,
      data: updatedFavourite.products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating favourites',
      error: error.message,
    });
  }
};

// @desc    Remove product from user's favourite list
// @route   DELETE /api/favourites/:productId
// @access  Private
const removeFromFavourite = async (req, res) => {
  try {
    const { productId } = req.params;
    let favourite = await Favourite.findOne({ userId: req.user.id });

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: 'Favourites list not found',
      });
    }

    favourite.products = favourite.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await favourite.save();

    const updatedFavourite = await Favourite.findById(favourite._id).populate({
      path: 'products',
      populate: [
        { path: 'colors', select: 'name hexCode' },
        { path: 'colorMedia.colorId', select: 'name hexCode' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from favourites successfully',
      count: updatedFavourite.products.length,
      data: updatedFavourite.products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing favourite product',
      error: error.message,
    });
  }
};

module.exports = {
  getFavourites,
  toggleFavourite,
  removeFromFavourite,
};
