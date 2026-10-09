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
    default: '',
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
  },
});

const statusHistorySchema = new mongoose.Schema(
  {
    orderStatus: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, default: 'system' }, // verify, webhook, admin, system
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const refundDetailsSchema = new mongoose.Schema(
  {
    refundId: { type: String, default: '' },
    refundedAmount: { type: Number, default: 0 },
    refundedAt: { type: Date, default: null },
  },
  { _id: false }
);

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
      index: true,
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
    currency: {
      type: String,
      default: 'INR',
    },
    paymentDetails: {
      paymentMethod: {
        type: String,
        default: 'Pending',
      },
      paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'refunded', 'partially_refunded', 'manual_review', 'Pending', 'Paid', 'Failed'],
        default: 'unpaid',
      },
      transactionId: {
        type: String,
        default: '',
      },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'pending',
    },
    razorpay_order_id: {
      type: String,
      index: true,
    },
    razorpay_payment_id: {
      type: String,
      index: true,
    },
    razorpay_signature: {
      type: String,
      default: '',
    },
    paid_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    stock_reserved_until: {
      type: Date,
      default: null,
    },
    confirmationSent: {
      type: Boolean,
      default: false,
    },
    refundDetails: {
      type: refundDetailsSchema,
      default: () => ({}),
    },
    statusHistory: [statusHistorySchema],
    idempotencyKey: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ 'shippingAddress.pincode': 1 });

module.exports = mongoose.model('Order', orderSchema);
