const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Saree',
      required: [true, 'Product ID is required'],
    },
    name: {
      type: String,
      required: true,
    },
    fabric: {
      type: String,
      default: '',
    },
    colorName: {
      type: String,
      default: '',
    },
    colorHex: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    itemSubtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  addressLine: {
    type: String,
    required: [true, 'Address is required'],
  },
  roadArea: {
    type: String,
    required: [true, 'Road/Area is required'],
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    orderSummary: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      deliveryCharge: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      couponCode: { type: String, default: '' },
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        default: 'Pending',
      },
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
      },
      transactionId: {
        type: String,
        default: '',
      },
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
