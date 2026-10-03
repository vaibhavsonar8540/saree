const Cart = require('../models/Cart');
const Saree = require('../models/Saree');

/**
 * Helper to calculate subtotal and format cart response with populated items
 */
const formatCartResponse = (cart) => {
  let grandTotal = 0;
  let totalItemsCount = 0;

  const formattedItems = cart.items.map((item) => {
    const product = item.productId;
    if (!product) return null;

    const unitPrice =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price;

    const itemSubtotal = unitPrice * item.quantity;
    grandTotal += itemSubtotal;
    totalItemsCount += item.quantity;

    // Selected color media if available
    let selectedColorMedia = null;
    if (item.colorId && Array.isArray(product.colorMedia)) {
      selectedColorMedia = product.colorMedia.find(
        (m) => m.colorId && m.colorId._id.toString() === item.colorId._id.toString()
      );
    }

    return {
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        SKU: product.SKU,
        price: product.price,
        discountedPrice: product.discountedPrice,
        thumbnail: selectedColorMedia?.thumbnail || product.thumbnail,
        stock: product.stock,
        isActive: product.isActive,
      },
      color: item.colorId
        ? {
            _id: item.colorId._id,
            name: item.colorId.name,
            hexCode: item.colorId.hexCode,
          }
        : null,
      colorMedia: selectedColorMedia || null,
      quantity: item.quantity,
      unitPrice,
      itemSubtotal,
    };
  }).filter(Boolean);

  return {
    cartId: cart._id,
    userId: cart.userId,
    itemsCount: formattedItems.length,
    totalQuantity: totalItemsCount,
    grandTotal,
    items: formattedItems,
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: 'items.productId',
        select: 'name SKU price discountedPrice thumbnail stock isActive colorMedia',
        populate: { path: 'colorMedia.colorId', select: 'name hexCode' },
      })
      .populate('items.colorId', 'name hexCode');

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const formattedCart = formatCartResponse(cart);

    res.status(200).json({
      success: true,
      data: formattedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: error.message,
    });
  }
};

// @desc    Add product to user's cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, colorId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID (productId) is required',
      });
    }

    // Verify product exists & active
    const product = await Saree.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or currently unavailable',
      });
    }

    // Check stock
    const qtyToAdd = Math.max(1, parseInt(quantity, 10));
    if (product.stock < qtyToAdd) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    const unitPrice =
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if same product & color combination exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (colorId ? item.colorId && item.colorId.toString() === colorId : !item.colorId)
    );

    if (existingIndex > -1) {
      // Update quantity
      cart.items[existingIndex].quantity += qtyToAdd;
      cart.items[existingIndex].price = unitPrice;
    } else {
      // Add new item
      cart.items.push({
        productId,
        colorId: colorId || null,
        quantity: qtyToAdd,
        price: unitPrice,
      });
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'name SKU price discountedPrice thumbnail stock isActive colorMedia',
        populate: { path: 'colorMedia.colorId', select: 'name hexCode' },
      })
      .populate('items.colorId', 'name hexCode');

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    const newQty = parseInt(quantity, 10);
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    if (newQty <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'name SKU price discountedPrice thumbnail stock isActive colorMedia',
        populate: { path: 'colorMedia.colorId', select: 'name hexCode' },
      })
      .populate('items.colorId', 'name hexCode');

    res.status(200).json({
      success: true,
      message: newQty <= 0 ? 'Item removed from cart' : 'Cart item updated',
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item',
      error: error.message,
    });
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'name SKU price discountedPrice thumbnail stock isActive colorMedia',
        populate: { path: 'colorMedia.colorId', select: 'name hexCode' },
      })
      .populate('items.colorId', 'name hexCode');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: formatCartResponse(updatedCart),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart',
      error: error.message,
    });
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        userId: req.user.id,
        itemsCount: 0,
        grandTotal: 0,
        items: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
